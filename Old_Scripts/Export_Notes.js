////////////////////////////////////////
//  Export Notes
//  ------------------------------------
//  Retrieve player and notes info
////////////////////////////////////////

const player = GetPlayer();

const module = player.GetVar("Course_Code") + "_" + player.GetVar("Module_Set") + "_notes";
let notes_object = JSON.parse(localStorage.getItem(module));
if (notes_object == 'undefined' || notes_object === null) {
  notes_object = {
    "title" : "",
    "module" : "",
    "contents" : {}
  };
}

/////////////////////////////////
//  Set Module Information
/////////////////////////////////

const course_code = player.GetVar("Course_Code");
const module_number = notes_object["module"];
const module_title = notes_object["title"];

/////////////////////////////////////
//  Sort Function
/////////////////////////////////////

let sortData = data => {
  // Get data into an array of objects
  // Add ID and index as properties
  const oa = [];
  for (id in data) {
    data[id].id = id;
    data[id].index = id;
    let di = [];
    for (var c=0;c<data[id].index.length;c++) {
        if (data[id].index[c] == "$") di.push(c);
    }
    di.reverse()
    for (var ni = 0; ni < di.length; ni++) {
        if (data[id].index[di[ni]+2] == ".") {
            data[id].index = data[id].index.substring(0,di[ni]) + "0" + data[id].index.substring(di[ni]);
        }
    }
    data[id].index = data[id].index.replace(/(\$|\.)/g,"").replace("00","");
    oa.push(data[id]);
  }
  
  // Find longest index
  let li = oa.map(o=>o.index).sort((a,b)=> b.length - a.length)[0].length;

  // Add 0*x to the end of each index
  // To have each index be the same length for sorting
  for (let i = 0; i < oa.length; i++) {
    let diff = li - oa[i].index.length;
    oa[i].index += "0".repeat(diff);
  }

  // Sort the array of objects based on their index property values
  let soa = oa.sort(( a, b ) => {
    if ( a.index < b.index ){
      return -1;
    }
    if ( a.index > b.index ){
      return 1;
    }
    return 0;
  })

  return soa;
}

////////////////////////////////
//  Convert notes into html
////////////////////////////////

let sections = sortData(notes_object.contents);
let compile = "";

for (let s = 0; s < sections.length; s++) {
  let section = sections[s];
  compile += "<h3 class='section'>" + section.title + "</h3>";

  let slides = sortData(section.slides);

  // Loop through slides
  for (let i = 0; i < slides.length; i++) {
    let slide = slides[i];
    let slide_title = slide.number + " : " + slide.title;
    

    // Check if sub-slide
    if (slide.parent_titles.length) {
      compile += "<div class='note sub-slide'>";
      compile += "<h4 class='sub-slide-title'>" + "&#8627; ".repeat(slide.parent_titles.length) + "Sub-slide " + slide_title + "</h4>";
      compile += "<h5 class='sub-slide-appender'>(From: ";
      slide.parent_titles.reverse();
      for (let ii = 0; ii < slide.parent_titles.length; ii++) {
        compile += slide.parent_titles[ii];
        if (ii != slide.parent_titles.length - 1) {
          compile += " > ";
        }
      }
      compile += ")</h5>";
    } else {
      compile += "<div class='note'>";
      compile += "<h4 class='slide-title'>Slide " + slide_title + "</h4>";
    }
    compile += "<p>" + slide.note + "</p>";
    compile += "</div>";
  }
}

////////////////////////
//  Write document
////////////////////////

var html = `
<!DOCTYPE html>
<html>
<head>
  <title>${course_code}_Module_${module_number}_Notes</title>
  <meta charset='UTF-8'>
  <style>
    .header-item {
      order: 1;
      width: 30%;
    }

    .section {
      font-size: 24px;
      display: block;
      padding: 10px;
      margin: 0;
      color: white;
      background: #0f3e70;
    }

    .slide-title,
    .sub-slide-title {
      font-size: 18px;
      font-weight: 600;
      color: #666666;
      margin-bottom: 15px;
    }

    .sub-slide-title {
      margin-bottom: 5px;
    }

    .sub-slide-appender {
      margin-top: 0;
    }

    .note {
      display: block;
      padding: 5px 15px;
      margin: 0;
      border-bottom: 1px solid #999999;
    }

    .note.sub-slide {
      padding-left: 2em;
      background-color: #eeeeee;
    }

    .note p {
      white-space: pre-wrap;
    }
  </style>
  <script>
    function MyPrint() {
      document.getElementById('print-note').style.display = 'none';
      window.print();
      setTimeout(function(){window.close();},100);
    }
  </script>
</head>
<body>
  <div style='background: #333333; color: white; padding: 0 15px 15px; margin-bottom: 0;'>
    <div style='display: flex; justify-content: space-between;'>
      <div class='header-item' style='text-align: left;'><h2>Notes</h2></div>
      <div class='header-item' style='text-align: center;'><h2>${course_code}, Module ${module_number}</h2></div>
      <div class='header-item' style='text-align: right;'><h2>BHSc</h2></div>
    </div>
    <h1 style='text-align: center;'>${module_title}</h1>
  </div>
  <div id="print-note" style="padding: 15px; margin-bottom: 0px; background: #eeeeee; text-align: center;">
    <p>Here is a compiled version of all your notes for this module. You cannot edit this page. It is recommended that you print or save this page to mitigate the risk of losing your notes. Remember, notes taken with this tool are linked specifically to the device you are currently on, and will not appear if you use a different device (laptop, computer, etc.).</p>
    <div style="width: 200px; margin: auto;"><button onclick="MyPrint();" style="width: 100%;">Print</button></div>
  </div>
  <div>
    ${compile}
  </div>
</body>
</html>
`;

var myWindow = window.open("","_blank", "width=850");
myWindow.document.write(html);