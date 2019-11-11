// Taiwan Post

$.Carrier_TWNP = function(code)
{
  var p = new PackageObj();
  p.carrier = '中華郵政';
  p.url = 'http://postserv.post.gov.tw/pstmail/main_mail.html';
  p.id = code;

  $.ajax({
    url: 'http://postserv.post.gov.tw/pstmail/EsoafDispatcher',
    type: 'POST',
    data: JSON.stringify(
      {
        'header':
        {
          'InputVOClass': 'com.systex.jbranch.app.server.post.vo.EB500100InputVO',
          'TxnCode': 'EB500100',
          'BizCode': 'query2',
          'StampTime': true,
          'SectionID': 'esoaf'
        },
        'body':
        {
          'MAILNO': code
        }
      }
    ),
    dataType: 'json',
    success: function(data)
    {
      const msg = data[0];
      const status = data[1];
      if (status['body']['result'] == 'success' &&
          msg['body']['host_rs'] !== undefined &&
          msg['body']['host_rs'] !== null)
      {
        p.type = $.trim(msg['body']['host_rs']['MAILTYPE']);
        const items = msg['body']['host_rs']['ITEM'];
        for (var i = 0; i < items.length; i++)
        {
          // console.log("data: " + JSON.stringify(items[i]));
          var s = new StatusObj();
          s.date = $.GetDate(items[i]['DATIME'], 'YYYYMMDDHHmmss', 8);
          s.description = $.trim(items[i]['STATUS']);
          s.location = (items[i]['BRHNO'] !== null ? items[i]['BRHNO'] + ' ' : '') + $.trim(items[i]['BRHNC']);
          s.destination = (items[i]['REVBRN-Z'] !== null ? items[i]['REVBRN-Z'] + ' ' : '') + $.trim(items[i]['REVBRC-Z']);
          if (s.destination.length > 1)
          {
            s.description = s.description + ' (' + s.destination + ')'
          }
          p.status.push(s);
        }

        const statusCount = p.status.length;
        if (statusCount > 0)
        {
          if (p.description == null)
          {
            p.description = p.status[0].description;
            if (p.description == '投遞成功')
            {
              p.delivered = true;
            }
          }

          p.origin = p.status[statusCount - 1].location;
          p.destination = p.status[0].destination;

          if (p.delivered)
          {
            p.destination = p.status[0].location;
          }
        }
      }
      else
      {
        p.error = true;
        if (msg['body']['msgData'] !== undefined)
        {
          p.errorMsg = msg['body']['msgData'].replace('KEY|', '');
        }
      }
    },
    error: function()
    {
      p.error = true;
      $.Callback(p);
    }
  })
  .done(function()
  {
    $.Callback(p);
  });
}
