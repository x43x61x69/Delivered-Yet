// SF-Express
// Usage: ?carrier=SFEX&id=[TRACKING_NUM]

$.Carrier_SFEX = function(code)
{
  var p = new PackageObj();
  p.carrier = 'SF-Express';
  p.url = 'https://www.sf-express.com/tw/tc/dynamic_function/waybill/#search/bill-number/' + code;
  p.id = code;

  $.ajaxPrefilter( function (options) {
    if (options.crossDomain && jQuery.support.cors) {
      var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
      options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
    }
  });

  $.get('http://www.sftrack.net/cgi-bin/GInfo.dll?MfcISAPICommand=EmmisTrackGen&w=sftracken&cemskind=%CB%B3%B7%E1IBS&cno=' + code, function(data)
  {
    const content = $.s2t($(data).find("script:contains('document.writeln(MadeLine(')").html());
    const delivered = $(data).find(".trackHead").html();
    console.log(delivered);
    console.log(delivered.indexOf('送达时间：'));
    if (delivered !== undefined &&
        delivered.indexOf('送达时间：') > -1)
    {
      p.delivered = true;
    }
    console.log(p.delivered);
    const items = content.split('\n');
    for (var i = items.length - 1; i > 0; i--)
    {
      if (items[i].length > 0)
      {
        var item = items[i].replace('document.writeln(MadeLine(\"', '');
        item = item.replace('));', '');
        const itemElm = item.split('\",\"');
        if (itemElm.length > 3)
        {
          var s = new StatusObj();
          s.date = $.GetDate(itemElm[0], 'YYYY-MM-DD HH:mm:ss');
          s.location = $.trim(itemElm[1]);
          s.description = $.trim(itemElm[2]);
          // if (p.description == null)
          // {
          //   p.description = s.description;
          //   const terms = ['妥投', '送達', '已簽收', '代簽收'];
          //   $.each(terms, function(i, v)
          //   {
          //     var match = s.description.indexOf(v);
          //     if(match > -1)
          //     {
          //       p.delivered = true;
          //     }
          //   });
          // }
          p.status.push(s);
        }
        if (p.description == null)
        {
          p.description = p.status[0].description;
        }
      }
    }
    $.Callback(p);
  })
  .fail(function() {
    p.error = true;
    $.Callback(p);
  });
}
