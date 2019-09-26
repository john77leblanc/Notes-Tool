////////////////////////////////////////
//  Retrieve player and notes info
////////////////////////////////////////

const player = GetPlayer();

const note_id = "Notes";

const note_text = player.GetVar(note_id);
const module = player.GetVar("Course_Code") + "_" + player.GetVar("Module_Set") + "_notes";
let notes_object = JSON.parse(localStorage.getItem(module));

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

////////////////////////////////////////////
//  Get sections, slide titles and notes
////////////////////////////////////////////

let sections = sortData(notes_object.contents);

let compile = "";

for (let s = 0; s < sections.length; s++) {

  let section = sections[s];

  compile += "---------------------------------------------------------\n";
  compile += "|  " + section.title + "\n";
  compile += "---------------------------------------------------------\n\n";

  let slides = sortData(section.slides);

  for (let i = 0; i < slides.length; i++) {
    let slide = slides[i];
    let slide_title = slide.number + " : " + slide.title;

    // Check if sub-slide
    if (slide['parent_titles'].length) {
      compile += "Sub-slide " + slide_title + "\n";
      compile += "(From: ";
      for (let ii = 0; ii < slide['parent_titles'].length; ii++) {
        compile += slide['parent_titles'][ii];
        if (ii != slide['parent_titles'].length - 1) {
          compile += " > ";
        }
      }
      compile += ")\n";
    } else {
      compile += "Slide " + slide_title + "\n";
    }
    compile += slide['note'] + "\n\n";
  }

}

player.SetVar("Compile",compile);