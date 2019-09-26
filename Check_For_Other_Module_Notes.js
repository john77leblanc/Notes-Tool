////////////////////////////////////////
//  Check For Other Module Notes
//  ------------------------------------
//  Retrieve player and notes info
////////////////////////////////////////

const player = GetPlayer();

for (var i = 0; i < 15; i++) {
  let mod_num = i;
  let module = player.GetVar("Course_Code") + "_" + mod_num + "_notes";
  let notes_object = JSON.parse(localStorage.getItem(module));
  if (notes_object != 'undefined' && notes_object !== null) {
    if (notes_object["contents"]) {
      player.SetVar("Module_Review_" + mod_num, notes_object["title"]);
    }
  }
}