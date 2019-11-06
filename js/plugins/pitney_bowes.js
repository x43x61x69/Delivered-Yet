// Pitney Bowes

$.carrier_PBI = function(code)
{
  var p = new PackageObj();
  p.carrier = 'Pitney Bowes';
  p.url = 'https://parceltracking.pb.com/' + code;
  p.id = code;

  $.ajax({
    url: 'https://reqbin.com/api/v1/Requests',
    type: 'POST',
    data: JSON.stringify(
      {
        'json':
        {
          'method': 'GET',
          'url': 'https://parceltracking.pb.com/ptsapi/track-packages/' + code
        }
      }
    ),
    dataType: 'json',
    success: function(data)
    {
      console.log(data);
    },
    error: function()
    {
      p.error = true;
      $.Callback(p);
    }
  })
  .done(function() {
    $.Callback(p);
  });
}
