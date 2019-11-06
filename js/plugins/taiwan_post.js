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
          s.location = $.trim(items[i]['BRHNC']);
          s.description = $.trim(items[i]['STATUS']);
          if (p.description == null)
          {
            p.description = s.description;
          }
          if (s.description == '投遞成功')
          {
            p.delivered = true;
          }
          p.status.push(s);
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
