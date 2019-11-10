// Pitney Bowes
// API: https://shipping.pitneybowes.com/overview.html
// Private API (CORS): https://parceltracking.pb.com/ptsapi/track-packages/[TRACKING_NUM]
// Get API Key here: https://signup.pitneybowes.com/signup/shipping
// Usage: ?carrier=[CARRIER_NAME]&id=[TRACKING_NUM]&key=[PBI_API_KEY]&secret=[PBI_API_SECRET]

const PBI_BASE_URL = 'https://api-sandbox.pitneybowes.com/';

$.Carrier_PBI = function(code)
{
  // $.Carrier_PBI_Supported(code, 'https://parceltracking.pb.com/' + code, 'PBI');
  $.Carrier_PBI_Private(code, 'https://parceltracking.pb.com/' + code);
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

$.Carrier_PBI_Private = function(code, url)
{
  const key = $.URLParam('key');
  const secret = $.URLParam('secret');

  var p = new PackageObj();
  p.carrier = 'Pitney Bowes';
  p.url = url;
  p.id = code;

  $.ajaxPrefilter( function (options) {
    if (options.crossDomain && jQuery.support.cors) {
      var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
      options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
    }
  });

  $.get('https://parceltracking.pb.com/ptsapi/track-packages/' + code, function(data)
  {
    // console.log(data);
    const msg = data;
    if (msg['service'] !== undefined)
    {
      p.carrier = msg['service'];
    }
    else
    {
      p.carrier = msg['carrier'];
    }
    p.reference = msg['orderId'];
    p.weight = msg['weight'] + ' ' + msg['weightUnit'];
    p.date = $.GetDate(msg['estimatedDeliveryDate'] + ' ' + msg['estimatedDeliveryTime'], 'YYYY-MM-DD HH:mm:ssZ');

    const origin = msg['senderLocation'];
    if (origin !== undefined)
    {
      var loc = [];
      if (origin['city'] != null)
      {
        loc.push(origin['city']);
      }
      if (origin['countyOrRegion'] != null)
      {
        loc.push(origin['countyOrRegion']);
      }
      if (origin['postalOrZipCode'] != null)
      {
        loc.push(origin['postalOrZipCode']);
      }
      if (origin['country'] != null)
      {
        loc.push(origin['country']);
      }
      p.origin = loc.join(', ');
    }

    const destination = msg['destinationLocation'];
    if (destination !== undefined)
    {
      var loc = [];
      if (destination['city'] != null)
      {
        loc.push(destination['city']);
      }
      if (destination['countyOrRegion'] != null)
      {
        loc.push(destination['countyOrRegion']);
      }
      if (destination['postalOrZipCode'] != null)
      {
        loc.push(destination['postalOrZipCode']);
      }
      if (destination['country'] != null)
      {
        loc.push(destination['country']);
      }
      p.destination = loc.join(', ');
    }

    const currentStatus = msg['currentStatus'];
    if (currentStatus !== null)
    {
      p.description = currentStatus['eventDescription'];
      var s = new StatusObj();
      s.description = p.description;
      if (currentStatus['packageStatus'] == 'DELIEVERED')
      {
        p.delivered = true;
      }
      var loc = [];
      s.date = $.GetDate(currentStatus['eventDate'] + ' ' + currentStatus['eventTime'], 'YYYY-MM-DD HH:mm:ssZ');
      const locElm = currentStatus['eventLocation'];
      if (locElm['city'] != null)
      {
        loc.push(locElm['city']);
      }
      if (locElm['countyOrRegion'] != null)
      {
        loc.push(locElm['countyOrRegion']);
      }
      if (locElm['country'] != null)
      {
        loc.push(locElm['country']);
      }
      s.location = loc.join(', ');
      p.status.push(s);
    }

    const items = msg['scanHistory']['scanDetails'];
    for (var i = 0; i < items.length; i++)
    {
      // console.log("data: " + JSON.stringify(items[i]));
      var s = new StatusObj();
      var loc = [];
      s.description = items[i]['eventDescription'];
      s.date = $.GetDate(items[i]['eventDate'] + ' ' + items[i]['eventTime'], 'YYYY-MM-DD HH:mm:ssZ');
      const locElm = items[i]['eventLocation'];
      if (locElm['city'] != null)
      {
        loc.push(locElm['city']);
      }
      if (locElm['countyOrRegion'] != null)
      {
        loc.push(locElm['countyOrRegion']);
      }
      if (locElm['country'] != null)
      {
        loc.push(locElm['country']);
      }
      s.location = loc.join(', ');
      s.url = items[i]['trackingUrl'];
      p.status.push(s);
    }

    $.Callback(p);
  })
  .fail(function() {
    p.error = true;
    $.Callback(p);
  });
}

$.Carrier_PBI_Supported = function(code, url, carrierName)
{
  const key = $.URLParam('key');
  const secret = $.URLParam('secret');

  var p = new PackageObj();
  p.carrier = carrierName;
  p.url = url;
  p.id = code;

  $.ajaxPrefilter( function (options) {
    if (options.crossDomain && jQuery.support.cors) {
      var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
      options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
    }
  });

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
