// Pitney Bowes
// API: https://shipping.pitneybowes.com/overview.html
// Private API (CORS): https://parceltracking.pb.com/ptsapi/track-packages/[TRACKING_NUM]
// Get API Key here: https://signup.pitneybowes.com/signup/shipping
// Usage: ?carrier=[CARRIER_NAME]&id=[TRACKING_NUM]&key=[PBI_API_KEY]&secret=[PBI_API_SECRET]

const PBI_BASE_URL = 'https://api-sandbox.pitneybowes.com/';

$.Carrier_PBI = function(code)
{
  $.Carrier_PBI_Supported(code, 'https://parceltracking.pb.com/' + code, 'PBI');
}

$.Carrier_UPS = function(code)
{
  $.Carrier_PBI_Supported(code, 'https://www.ups.com/track?tracknum=' + code, 'UPS');
}

$.Carrier_USPS = function(code)
{
  $.Carrier_PBI_Supported(code, 'https://tools.usps.com/go/TrackConfirmAction?tLabels=' + code, 'USPS');
}

$.Carrier_IMB = function(code)
{
  $.Carrier_PBI_Supported(code, 'https://tracking.pb.com/' + code, 'IMB');
}

$.Carrier_NEWG = function(code)
{
  $.Carrier_PBI_Supported(code, 'https://tracking.pb.com/' + code, 'NEWGISTICS');
}

$.Carrier_PBI_Supported = function(code, url, carrierName)
{
  const key = $.URLParam('key');
  const secret = $.URLParam('secret');

  var p = new PackageObj();
  p.carrier = carrierName;
  p.url = url;
  p.id = code;

  $.Carrier_PBI_GetToken(p, key, secret);
}

$.Carrier_PBI_GetToken = function(p, key, secret)
{
  $.ajax({
    url: PBI_BASE_URL + 'oauth/token',
    type: 'POST',
    contentType : 'application/x-www-form-urlencoded',
    dataType: 'json',
    headers: {
      'Authorization': 'Basic ' + btoa(key + ':' + secret)
    },
    data: {
      'grant_type': 'client_credentials'
    },
    succes: function(data, textStatus)
    {
      // console.log(data);
    },
    error: function(xhr, ajaxOptions, thrownError)
    {
      console.log('error: ' + thrownError);
      p.error = true;
      p.errorMsg = thrownError;
    }
  })
  .done(function(data)
  {
    // console.log(data);
    const accessToken = data['access_token'];
    if (!p.error && accessToken)
    {
      $.Carrier_PBI_Track(p, accessToken);
    }
    else
    {
      $.Callback(p);
    }
  });
}

$.Carrier_PBI_Track = function(p, accessToken)
{
  $.ajax({
    url: PBI_BASE_URL + 'shippingservices/v1/tracking/' + p.id + '?packageIdentifierType=TrackingNumber&carrier=' + p.carrier,
    type: 'GET',
    contentType : 'application/x-www-form-urlencoded',
    dataType: 'json',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    succes: function(data, textStatus)
    {
      // console.log(data);
    },
    error: function(xhr, ajaxOptions, thrownError)
    {
      console.log('error: ' + thrownError);
      p.error = true;
      p.errorMsg = thrownError;
      const msg = xhr.responseJSON['errors'][0];
      if (msg !== null)
      {
        // console.log(msg);
        if (msg['userMessage'] !== null)
        {
          p.errorMsg = msg['userMessage'];
        }
        else
        {
          p.errorMsg = msg['errorDescription'];
        }
      }
      $.Callback(p);
    }
  })
  .done(function(data)
  {
    // console.log(data);
    const msg = data;
    p.description = msg['status'];
    if (p.description !== null)
    {
      p.description.replace(/([a-z])([A-Z])/g, '$1 $2');
    }
    p.weight = msg['weight'];
    const items = msg['scanDetailsList'];
    for (var i = 0; i < items.length; i++)
    {
      // console.log("data: " + JSON.stringify(items[i]));
      var s = new StatusObj();
      var loc = [];
      s.date = $.GetDate(items[i]['eventDate'] + items[i]['eventTime'], 'YYYY-MM-DDHH:mm:ss');
      if (items[i]['eventCity'] != null)
      {
        loc.push(items[i]['eventCity']);
      }
      if (items[i]['eventStateOrProvince'] != null)
      {
        loc.push(items[i]['eventStateOrProvince']);
      }
      if (items[i]['country'] != null)
      {
        loc.push(items[i]['country']);
      }
      s.location = loc.join(', ');
      s.description = $.trim(items[i]['scanDescription']);
      if (s.description == 'Delivered')
      {
        p.delivered = true;
      }
      p.status.push(s);
    }

    $.Callback(p);
  });
}
