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
  console.log(packageObj);
  $('#carrierLabel').text(packageObj.carrier);
  $('#idLabel').text(packageObj.id);
  if (!packageObj.error)
  {
    $('#trackingLabel').text(packageObj.delivered ? 'Delivered' : '');
    for (var i = 0; i < packageObj.status.length; i++)
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
    $('#trackingLabel').text(packageObj.errorMsg != null ? packageObj.errorMsg : 'Error');
    $("#statusTable").remove();
  }
}
