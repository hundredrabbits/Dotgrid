function Serializer()
{
  var __data_segments__ = 0;
  var __data_thickness__ = 1;
  var __data_linecap__ = 2;
  var __data_color__ = 3;
  var __data_mirror_index__ = 4;
  var __data_fill__ = 5;

  this.serialize = function()
  {
    // Store the data in an array.
    // This keeps away the property names, which just clutter up everything.
    var data = [
      [],
      dotgrid.thickness,
      dotgrid.linecap,
      dotgrid.color,
      dotgrid.mirror_index,
      dotgrid.fill
    ];

    for (var id in dotgrid.segments) {
      data[__data_segments__][id] = this.serialize_segment(dotgrid.segments[id]);
    }

    return data;
  }

  this.deserialize = function(data)
  {
    if (data[__data_segments__]) {
      for (var id in data[__data_segments__]) {
        data[__data_segments__][id] = this.deserialize_segment(data[__data_segments__][id]);
      }
    }

    var d = (index, fallback) => index < data.length ? data[index] : fallback;

    dotgrid.segments = d(__data_segments__, []);
    dotgrid.thickness = d(__data_thickness__, 10);
    dotgrid.linecap = d(__data_linecap__, "square");
    dotgrid.color = d(__data_color__, "#000000");
    dotgrid.mirror_index = d(__data_mirror_index__, 0);
    dotgrid.fill = d(__data_fill__, false);
  }

  this.serialize_segment = function(s) {
    // Return falsy values (null, 0, false, "", ...) directly.
    if (!s) return s;

    var data = [";"];
    // Get rid of non-serializable stuff (i.e. functions).
    s = JSON.parse(JSON.stringify(s));
    // Store everything in arrays instead of objects, saving characters.
    for (var id in s) {
      // Skip the non-serialzied path name.
      if (s.__serialized_name__ && id === "name")
        continue;
      
        var prop = s[id];

      if (typeof(prop) === "object") {
        prop = this.serialize_segment(prop);
      }

      data.push(prop);
    }
    return data;
  }

  this.deserialize_segment = function(data) {
    var name = data.splice(0, 2)[1];

    // Unserialize anything that's serialized.
    for (var id in data) {
      var prop = data[id];

      if (prop && typeof(prop) === "object" && prop.length && prop[0] === ";") {
        prop = this.deserialize_segment(prop);
      }

      data[id] = prop;
    }

    var s = {};
    window[name].apply(s, data);
    return s;
  }

}