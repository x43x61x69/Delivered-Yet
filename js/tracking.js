// Utils -----------------------------------------

$.URLParam = function(name)
{
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results != null && results.length >= 1)
    {
      return results[1] || 0;
    }
    return null;
}

$.GetDate = function(dateString, format, offset)
{
  var mDate = moment(dateString, format);
  mDate.utcOffset(offset);
  return mDate.toDate();
}

function StatusObj()
{
  this.date = null;
  this.location = null;
  this.description = null;
  this.error = false;
};

function PackageObj()
{
  this.carrier = null;
  this.id = null;
  this.url = null;
  this.description = null;
  this.reference = null;
  this.date = null;
  this.type = null;
  this.weight = -1;
  this.delivered = false;
  this.status = [];
  this.error = false;
  this.errorMsg = null;
};

$.Callback = function(packageObj)
{
  // console.log(packageObj);
  $('#carrierLabel').text(packageObj.carrier);
  $('#idLabel').text('Tracking Number: ')
  .append($('<a>')
    .text(packageObj.id)
    .attr("href", packageObj.url !== null ? packageObj.url : '#')
  );

  if (packageObj.date != null)
  {
    $('#dateLabel').text('Estimated Delivery: ' + moment(packageObj.date).format('YYYY/MM/DD hh:MM:SS A'));
  }
  else
  {
    $('#dateLabel').remove();
  }

  if (packageObj.reference != null)
  {
    $('#refLabel').text('Reference: ' + packageObj.reference);
  }
  else
  {
    $('#refLabel').remove();
  }

  if (!packageObj.error)
  {
    const count = packageObj.status.length;
    if (packageObj.description != null)
    {
      $('#trackingLabel').text(packageObj.description);
    }
    else
    {
      $('#trackingLabel').text(packageObj.delivered ? 'Delivered' : (count > 0 ? 'In Transit' : 'No Information'));
    }

    for (var i = 0; i < count; i++)
    {
      $("#statusTable").find('tbody')
        .append($('<tr>')
          .append($('<td>').text(moment(packageObj.status[i].date).format('YYYY/MM/DD hh:MM:SS A')))
          .append($('<td>').text(packageObj.status[i].location))
          .append($('<td>').text(packageObj.status[i].description))
        );
    }
  }
  else
  {
    $('#trackingLabel').text(packageObj.errorMsg != null ? packageObj.errorMsg : 'Unknown Error');
  }
}
