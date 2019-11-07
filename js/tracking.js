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
  if (offset !== null)
  {
    mDate.utcOffset(offset);
  }
  return mDate;
}

function StatusObj()
{
  this.date = null;
  this.location = null;
  this.description = null;
  this.url = null;
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
  this.weight = null;
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

  if (packageObj.date !== null)
  {
    $('#dateLabel').text('Estimated Delivery: ' + packageObj.date.format('YYYY/MM/DD hh:MM:SS A Z'));
  }
  else
  {
    $('#dateLabel').remove();
  }

  if (packageObj.reference !== null)
  {
    $('#refLabel').text('Reference: ' + packageObj.reference);
  }
  else
  {
    $('#refLabel').remove();
  }

  if (packageObj.weight !== null)
  {
    $('#weightLabel').text('Weight: ' + packageObj.weight);
  }
  else
  {
    $('#weightLabel').remove();
  }

  if (!packageObj.error)
  {
    const count = packageObj.status.length;
    if (packageObj.description !== null)
    {
      $('#trackingLabel').text(packageObj.description);
    }
    else
    {
      $('#trackingLabel').text(packageObj.delivered ? 'Delivered' : (count > 0 ? 'In Transit' : 'No Information'));
    }

    for (var i = 0; i < count; i++)
    {
      $('#idLabel').text('Tracking Number: ')
      .append($('<a>')
        .text(packageObj.id)
        .attr("href", packageObj.url !== null ? packageObj.url : '#')
      );
      if (packageObj.status[i].url !== null)
      {
        $("#statusTable").find('tbody')
          .append($('<tr>')
            .append($('<td>').text(moment(packageObj.status[i].date).format('YYYY/MM/DD hh:mm:ss A')))
            .append($('<td>').text(packageObj.status[i].location))
            .append($('<td>')
            .append($('<a>')
              .text(packageObj.status[i].description)
              .attr("href", packageObj.status[i].url)
              .attr("target", '_blank')
            ))
          );
      }
      else
      {
        $("#statusTable").find('tbody')
          .append($('<tr>')
            .append($('<td>').text(moment(packageObj.status[i].date).format('YYYY/MM/DD hh:mm:ss A')))
            .append($('<td>').text(packageObj.status[i].location))
            .append($('<td>').text(packageObj.status[i].description))
          );
      }
    }
  }
  else
  {
    $('#trackingLabel').text(packageObj.errorMsg != null ? packageObj.errorMsg : 'Unknown Error');
  }
}
