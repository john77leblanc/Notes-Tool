// Notes Tool for 360 v5.0
// By Johnathan LeBlanc

let template = `
  <div class="header">
    <div id="title" tabindex="1"></div>
    <div class="controls">
      <button id="menu" pair="menu" tabindex="1" aria-label="Menu">&#9776;</button>
      <button id="close" tabindex="1" aria-label="Close">&#10006;</button>
    </div>
    <div id="menu-dropdown" class="dropdown" pair="menu">
      <div class="rule"></div>
      <div class="data">
        <div id="version"></div>
        <div><span id="filesize"></span>/10MB</div>
      </div>
      <div class="controls">
        <button id="export" tabindex="1">Export Notes</button>
        <button id="clear-all" class="warning" tabindex="1">Delete All Notes</button>
      </div>
    </div>
  </div>
  <div id="main" class="disabled">
    <div id="editor">
      <div id="note-title"></div>
      <div id="textarea" contenteditable spellcheck="true" tabindex="1"></div>
      <div id="save-message"><span>&#10003; Note Saved</span></div>
      <div class="controls">
        <div>
          <button id="bold" tabindex="1" aria-label="Bold"><strong>B</strong></button>
          <button id="italic" tabindex="1" aria-label="Italicize"><em>I</em></button>
          <button id="underline" tabindex="1" aria-label="Underline"><u>U</u></button>
        </div>
        <div>
          <button id="clear" class="warning" tabindex="1">Clear</button>
        </div>
      </div>
    </div>
    <div id="message" class="active"></div>
  </div>
  <div id="sidebar">
    <div id="sections"></div>
    <div id="custom"></div>
  </div>
`;

let css = `
#notes-frame, #notes-frame * {
  box-sizing: border-box;
  transition: color 0.25s, background-color 0.25s, opacity 0.25s;
}
#notes-frame :focus-within { outline: none; }
#notes-frame ::-webkit-scrollbar { width: 4px; }
#notes-frame ::-webkit-scrollbar-track { background: white; }
#notes-frame ::-webkit-scrollbar-thumb { background: #999; border-radius: 2px; }

#notes-frame input {
  display: block;
  font-family: inherit;
  padding: 5px 10px;
}

#notes-frame button {
  font-size: 14px;
  display: inline-block;
  color: #353535;
  background-color: white;
  padding: 5px 10px;
  border: none;
  cursor: pointer;
}

#notes-frame button:not(:last-child) { margin-right: 10px; }
#notes-frame button:hover { background-color: rgba(255,255,255,0.6); }

#notes-frame button.warning:hover {
  color: white !important;
  background-color: red !important;
}

#notes-frame .dropdown {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.25s;
}

#notes-frame .dropdown.active { max-height: 100px; }

#notes-frame .popup { position: relative; }

#notes-frame .popup:after {
  opacity: 0;
  text-align: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 50%;
  width: 100px;
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  pointer-events: none;
  transition: bottom 0.25s;
}

#notes-frame {
  font-family: "Open Sans", sans-serif;
  font-size: 16px;
  position: absolute;
  top: 25%;
  right: 25%;
  z-index: 9999;
  width: 100%;
  max-width: 700px;
  min-width: 400px;
  backdrop-filter: blur(15px);
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  display: grid;
  overflow: hidden;
  border-radius: 5px;
  grid-template-rows: auto minmax(auto, 350px);
  grid-template-columns: minmax(150px, 1fr) 2fr;
  grid-template-areas:
    "header header"
    "sidebar main";
}

#notes-frame .header {
  grid-area: header;
  justify-content: space-between;
  padding: 5px 10px;
  color: white;
  background-color: rgba(20,20,20,0.8);
  display: grid;
  grid-template-columns: 4fr 1fr;
  grid-template-areas:
    "title controls"
    "dropdown dropdown"
  ;
}

#notes-frame .header #title {
  grid-area: title;
  cursor: move;
}

#notes-frame .header > .controls {
  grid-area: controls;
  justify-self: right;
}

#notes-frame .header > .controls button {
  color: white;
  background-color: transparent;
  font-size: 1em;
  margin: 0;
}

#notes-frame .header button:hover { background-color: rgba(200,200,200,0.3); }

#notes-frame .header button.active {
  color: #353535;
  background-color: white;
}

#notes-frame .header .dropdown { 
  grid-area: dropdown;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

#notes-frame .header .dropdown > div:not(:first-child) { margin-bottom: 5px; }

#notes-frame .header .dropdown .rule {
  grid-column-start: 1;
  grid-column-end: 3;
  border-top: 1px solid white;
  margin-top: 10px;
}

#notes-frame .header .dropdown .controls {
  display: flex;
  justify-content: flex-end;
}

#notes-frame .header .dropdown button {
  font-size: 16px;
  color: white;
  background-color: rgba(255,255,255,0.3);
}

#notes-frame .header .dropdown button:hover {
  color: #353535;
  background-color: white;
}

#notes-frame #main, #notes-frame #sidebar { background-color: rgba(255,255,255,0.7); }

#notes-frame #main {
  grid-area: main;
  position: relative;
  padding: 10px;
}

#notes-frame #main #editor {
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr minmax(auto, 30px);
  gap: 10px;
}

#notes-frame #main #editor.disabled { pointer-events: none; }

#notes-frame #main #message {
  display: none;
  color: white;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  text-align: center;
  justify-content: center;
  align-items: center;
  animation: fadein 0.25s;
}

#notes-frame #main #message.active:before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0,0,0,0.8);
  animation: fadein 0.25s;
}

#notes-frame #main #message.active { display: flex; }
#notes-frame #main #message > div { z-index: 1; }
#notes-frame #main #message p { margin-top: 0; }
#notes-frame #main #message button { font-size: 16px; }
#notes-frame #main #message input {
  margin: 0 auto 20px;
  background-color: white;
}

@keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}

#notes-frame #main #note-title {
  font-size: 0.8em;
  display: flex;
}

#notes-frame #main #note-title button {
  border-radius: 5px;
  background-color: white;
  text-align: left;
}

#notes-frame #main #note-title button:first-child:after {
  content: "Jump to slide";
  background-color: white;
}

#notes-frame #main #note-title button:first-child:hover:after {
  opacity: 1;
  bottom: 100%;
}

#notes-frame #main #note-title #custom-title {
  border: 1px solid #666;
  margin-right: 10px;
  background-color: transparent;
  width: 100%;
}

#notes-frame #main #textarea {
  padding: 10px;
  overflow-x: hidden;
  overflow-y: scroll;
  border: 1px solid #666;
  border-radius: 3px;
  background-color: rgba(255,255,255,0);
  transition: border 0.25s, border-radius 0.25s;
}

#notes-frame #main #textarea * { max-width: 100%; }

#notes-frame #main #save-message {
  display: none;
  align-items: center;
  justify-content: flex-start;
  font-weight: 600;
  padding-left: 10px;
  color: white;
  background-color: green;
}

#notes-frame #main #save-message.active {
  display: flex;
  animation: fade 1.5s;
}

@keyframes fade {
  0%,100%    { opacity: 0; }
  25%,75%   { opacity: 1; }
  
}

#notes-frame #main .controls {
  opacity: 0;
  display: none;
}

#notes-frame #main .controls div { display: flex; }
#notes-frame #main .controls > div:first-child { font-family: serif; }

#notes-frame #main #editor:focus-within #note-title #custom-title,
#notes-frame #main #editor:focus-within #textarea {
  background-color: white;
  border: 1px solid transparent;
  border-radius: 0;
}

#notes-frame #main #editor:focus-within .controls {
  opacity: 1;
  display: flex;
  justify-content: space-between;
}

#notes-frame #main:focus-within,
#notes-frame #main:focus-within ~ #sidebar { background-color: rgba(100,100,100,0.3); }

#notes-frame #sidebar {
  --b: 1px solid #999;
  grid-area: sidebar;
  height: 100%;
  border-right: var(--b);
  overflow-y: scroll;
}

#notes-frame #sidebar button {
  display: block;
  text-align: left;
  width: 100%;
  padding: 10px;
}

#notes-frame #sidebar button:not(.dropdown button) { 
  background-color: rgba(255,255,255,0.3);
  border-bottom: var(--b);
}

#notes-frame #sidebar button:not(.dropdown button):hover { background-color: white; }

#notes-frame #sidebar .dropdown button {
  position: relative;
  color: white;
  padding-right: 20px;
  background-color: rgba(0,0,0,0.5);
}

#notes-frame #sidebar .dropdown button:not(:last-child) { border-bottom: var(--b); }
#notes-frame #sidebar .dropdown button:hover { background-color: rgba(0,0,0,0.6); }

#notes-frame #sidebar .dropdown button:after {
  opacity: 0;
  content: "";
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: white;
}

#notes-frame #sidebar .dropdown button.active:after { opacity: 1; }

#notes-frame #sidebar #add {
  --size: 35px;
  position: relative;
  width: var(--size);
  height: var(--size);
  font-size: 1.5em;
  font-weight: 600;
  line-height: 0;
  text-align: left;
  margin: 10px auto;
  border: none;
  border-radius: calc(var(--size)/2);
  background-color: white;
  box-shadow: 0 2px 4px rgb(20 20 20 / 80%);
  overflow: hidden;
  transition: width 0.25s;
}

#notes-frame #sidebar #add:hover {
  width: 75%;
}

#notes-frame #sidebar #add span {
  position: absolute;
  display: block;
}

#notes-frame #sidebar #add span:first-child {
  left: calc(var(--size)/2);
  transform: translateX(-50%);
}

#notes-frame #sidebar #add span:last-child {
  left: var(--size);
  font-size: 0.7em;
  width: 100%;
}
`;

let notesTool = () => {
  let version = "v5.0";

  // Shorthands
  const select = query => document.querySelector(query);
  const selectAll = query => document.querySelectorAll(query);
  const create = (type, html=null) => {
    let el = document.createElement(type);
        el.innerHTML = html;

    if (type === "button" || type === "input" || type === "p") el.setAttribute("tabindex","1");
    return el;
  };
  const click = (el, func) => el.addEventListener("click", func);
  const format = (type, arg = false) => () => {
    document.execCommand(type, false, arg);
    self.textarea().focus();
  };

  // Where to write the Notes Tool HTML to
  let target = select("body");

  // Shorthand selectors that define the names in a single space
  let self = {
    frame: () => select("#notes-frame"),
    title: () => select("#title"),
    version: () => select("#version"),
    filesize: () => select("#filesize"),
    noteTitle: () => select("#note-title"),
    main: () => select("#main"),
    textarea: () => select("#textarea"),
    saveMessage: () => select("#save-message"),
    message: () => select("#message"),
    sidebar: () => select("#sidebar"),
    sections: () => select("#sections"),
    custom: () => select("#custom")
  }

  const mouseData = {
    dragging: false,
    posX: null,
    posY: null,
    difX: 0,
    difY: 0
  };

  let player = GetPlayer();
  
  const moduleData = {
    title: player.GetVar("Module_Title"),
    course: player.GetVar("Course_Code").replace(/ /g,""),
    module: player.GetVar("Module").replace(/ /g,""),
  };
  moduleData.file = `${moduleData.course}_${moduleData.module}_notes`;

  //-----------------------
  // Temporary Notes Object
  //-----------------------
  let noteTemplate = Object.freeze({
    title: moduleData.title,
    course: moduleData.course,
    module: moduleData.module,
    custom: {
      id: "custom",
      title: "Custom Notes",
      items: []
    },
    sections: []
  });

  let notesObj = {};
  Object.assign(notesObj, noteTemplate);

  let snapshot; // For checking note changes

  let initialized = false;
  
  const components = {
    titleButton: (data) => {
      let button = create("button", data.title);
          button.id = "jump";
          button.classList.add("popup");

      click(button, () => {
        let section = self.textarea().getAttribute("section-id");
        let slide = self.textarea().getAttribute("slide-id");
        let target = select(`nav [notes-section-id="${section}"]`);
            target = target.parentNode.querySelector(`[notes-slide-id="${slide}"]`);
            target.click();
      });

      return button;
    },
    customTitleButton: (data) => {
      let title = create("input", data.title);
          title.id = "custom-title";
          title.value = data.title;
          title.addEventListener("blur", () => methods.saveNote(true));

      return title;
    },
    deleteButton: (sectionId, slideId) => {
      let button = create("button", "Delete");
          button.id = "delete";
          button.classList.add("warning");

      click(button, () => {
        let text = "Are you sure you want to delete this note?";
        methods.confirm(text, methods.removeNote(sectionId, slideId));
      });

      return button;
    },
    sidebarButton: (data) => {
      let button = create("button", data.title);
          button.id = `s-${data.id}`;
          button.setAttribute("pair", data.id);
      
      return button;
    },
    sidebarDropdown: (data) => {
      let dropdown = create("div");
          dropdown.id = `s-${data.id}`;
          dropdown.classList.add("dropdown");
          dropdown.setAttribute("pair", data.id);

      data.items.forEach(e => {
        let subButton = components.sidebarSub(data.id, e);
        dropdown.appendChild(subButton);
      });

      return dropdown;
    },
    sidebarSub: (sectionId, data) => {
      let button = create("button", data.title);
          button.id = `s-${data.id}`;

      click(button, (e) => {
        methods.resetDropdownButtons();
        e.target.classList.add("active");
        methods.loadNote(sectionId, methods.findNoteByIds(sectionId, data.id));
        methods.clearMessage();
      });
      
      return button;
    },
    newNoteButton: () => {
      let button = create("button", "<span>+</span><span>New Note</span>");
          button.id = "add";
      click(button, () => methods.setMessage(components.newNoteMessage()));
      
      return button;
    },
    selectNoteMessage: () => {
      let div = create("div");
      let text = create("p", "&#x21E6; Select a note to start, or create a new note.");
      let button = create("button", "Create Note");
      click(button, () => methods.setMessage(components.newNoteMessage()));
      
      div.appendChild(text);
      div.appendChild(button);

      return div;
    },
    confirmMessage: (message, func) => {
      let div = create("div");
      let text = create("p", message);
      
      let yes = create("button", "Yes");
          click(yes, () => {
            methods.clearMessage();
            func();
          });

      let no = create("button", "No");
          click(no, () => {
            methods.clearMessage();
            if (select("#sidebar .dropdown .active")) self.textarea().focus();
          });

      div.appendChild(text);
      div.appendChild(yes);
      div.appendChild(no);
      
      return div;
    },
    newNoteMessage: () => {
      let div = create("div");
      let text = create("p", "Create a new note?");
      
      let slide = create("button", "Create From Slide");
      click(slide, slideMethods.createNote);

      let custom = create("button", "Create Custom");
      click(custom, () => {
        methods.clearMessage();
        methods.setMessage(components.customNoteMessage());
        select("#notes-frame #message input").focus();
      });

      let cancel = create("button", "Cancel");
      click(cancel, methods.clearMessage);

      div.appendChild(text);
      div.appendChild(slide);
      div.appendChild(custom);
      div.appendChild(cancel);
      
      return div;
    },
    customNoteMessage: () => {
      let div = create("div");
      let text = create("p","Custom note title:");

      let input = create("input");

      let createButton = create("button","Create");
      click(createButton, () => {
        methods.clearMessage();
        methods.createCustomNote(input.value);
      });

      let cancel = create("button", "Cancel");
      click(cancel, methods.clearMessage);

      div.appendChild(text);
      div.appendChild(input);
      div.appendChild(createButton);
      div.appendChild(cancel);

      return div;
    }
  };

  const methods = {
    updateTitle: () => {
      self.title().innerHTML = `${notesObj.course} Module ${notesObj.module}<br />${notesObj.title}`;
    },
    updateFileSize: () => {
      let filesize = JSON.stringify(notesObj).length / 1000000;
      self.filesize().innerHTML = filesize;
    },
    findSectionById: (id) => notesObj.sections.find(s => s.id == id),
    findNoteByIds: (sectionId, slideId) => {
      let section = sectionId === "custom"
        ? notesObj.custom
        : notesObj.sections.find(s => s.id == sectionId);

      return section.items.find(s => s.id == slideId);
    },
    loadSidebar: () => {
      slideMethods.sortAll();
      methods.loadSections();
      methods.loadCustom();
    },
    loadSections: () => {
      self.sections().innerHTML = null;
      notesObj.sections.forEach(section => {
        let sidebarButton = components.sidebarButton(section);
        click(sidebarButton, methods.makeDropdown);
        self.sections().appendChild(sidebarButton);
        self.sections().appendChild(components.sidebarDropdown(section));
      });
    },
    loadCustom: () => {
      self.custom().innerHTML = null;
      let custom = notesObj.custom;
      if (custom.items.length) {
        self.custom().appendChild(components.sidebarButton(custom));
        self.custom().appendChild(components.sidebarDropdown(custom));
        click(select("#notes-frame #custom button[pair]"), methods.makeDropdown);
      }
    },
    makeDropdown: (event) => {
      event.target.classList.toggle("active");

      let dropdown = select(`.dropdown[pair="${event.target.getAttribute("pair")}"]`);
      dropdown.classList.toggle("active");

      if (event.target.id != "menu") methods.setDropdownHeight(dropdown);
    },
    setDropdownHeight: (dropdown) => {
      dropdown.style.maxHeight = dropdown.classList.contains("active")
        ? `${methods.getChildHeight(dropdown)}px`
        : 0;
    },
    getChildHeight: (element) => {
      return Array.from(element.childNodes).reduce((sum, e) => sum += e.offsetHeight, 0);
    },
    resetDropdownButtons: () => {
      selectAll("#notes-frame #sidebar .dropdown button")
        .forEach(button => {
          button.classList.remove("active");
        })
    },
    loadNote: (sectionId, data) => {
      self.noteTitle().innerHTML = null;
      sectionId === "custom"
        ? self.noteTitle().appendChild(components.customTitleButton(data))
        : self.noteTitle().appendChild(components.titleButton(data));
      self.noteTitle().appendChild(components.deleteButton(sectionId, data.id));
      self.textarea().setAttribute("section-id", sectionId);
      self.textarea().setAttribute("slide-id", data.id);
      self.textarea().innerHTML = data.note;
      snapshot = data.note;
    },
    saveNote: (custom = false) => {
      let sectionId = self.textarea().getAttribute("section-id");
      let slideId = self.textarea().getAttribute("slide-id");
      let note = self.textarea().innerHTML;
      let title = sectionId === "custom"
        ? select("#notes-frame #main #note-title #custom-title").value
        : false;

      if (note != snapshot || custom == false) {
        let data = methods.findNoteByIds(sectionId, slideId);
        data.note = note;
        if (title) {
          data.title = title;
          select(`#notes-frame #sidebar .dropdown#s-${sectionId} button#s-${slideId}`).innerHTML = title;
          methods.setDropdownHeight(select("#notes-frame #sidebar .dropdown#s-custom"));
          methods.updateCustomNoteIds();
        }

        methods.saveNotesObj();
        methods.saveAlert();
        snapshot = data.note;
      }
    },
    createCustomNote: (title) => {
      let data = {
        id: notesObj.custom.items.length + 1,
        title,
        note: ""
      };

      notesObj.custom.items.push(data);
      methods.loadCustom();

      let dropdownButton = select("#notes-frame #sidebar button#s-custom");
      
      dropdownButton.classList.add("active");

      let dropdown = select("#notes-frame #sidebar .dropdown#s-custom");
          dropdown.classList.add("active");

      methods.updateCustomNoteIds();
      methods.setDropdownHeight(dropdown);
      methods.resetDropdownButtons();
      select("#notes-frame #sidebar .dropdown#s-custom > button:last-child").classList.add("active");
      methods.loadNote("custom", data);
      methods.clearMessage();
      self.textarea().focus();
    },
    updateCustomNoteIds: () => {
      let custom = notesObj.custom.items;
      let buttons = selectAll("#notes-frame #sidebar .dropdown#s-custom button");

      for (let index in custom) {
        custom[index].id = index;
        buttons[index].id = "s-" + index;
      }
    },
    clearEditor: () => {
      self.noteTitle().innerHTML = null;
      self.textarea().innerHTML = null;
      self.textarea().removeAttribute("section-id");
      self.textarea().removeAttribute("slide-id");
      document.activeElement.blur();
      methods.setMessage(components.selectNoteMessage());
    },
    clearTextarea: () => {
      self.textarea().innerHTML = null;
      self.textarea().focus();
    },
    removeNote: (sectionId, slideId) => () => {
      let section = sectionId === "custom"
        ? notesObj.custom
        : methods.findSectionById(sectionId);

      let slide = methods.findNoteByIds(sectionId, slideId);

      let index = section.items.indexOf(slide);
      section.items.splice(index, 1);

      select(`#notes-frame #sidebar .dropdown#s-${sectionId} button#s-${slideId}`).remove();

      methods.clearEditor();

      if (!section.items.length) methods.removeSection(section);
      methods.updateCustomNoteIds();
      methods.saveNotesObj();
    },
    removeSection: (section) => {
      if (section.id !== "custom") {
        let index = notesObj.sections.indexOf(section);
        notesObj.sections.splice(index, 1);
      }

      select(`#notes-frame #sidebar > div > button#s-${section.id}`).remove();
      select(`#notes-frame #sidebar >div .dropdown#s-${section.id}`).remove();
    },
    setMessage: (element) => {
      self.message().innerHTML = null;
      self.message().appendChild(element);
      self.main().classList.add("disabled");
      self.message().classList.add("active");
    },
    clearMessage: () => {
      self.main().classList.remove("disabled");
      self.message().classList.remove("active");
      if (!select("#sidebar .dropdown .active")) methods.setMessage(components.selectNoteMessage());
    },
    saveAlert: () => {
      self.saveMessage().classList.add("active");
      setTimeout(() => {
        self.saveMessage().classList.remove("active");
      }, 1500);
    },
    loadNotesObj: () => {
      let data = localStorage.getItem(moduleData.file);
      if (data != null) {
        notesObj = JSON.parse(data);
        console.log(moduleData.file, "loaded successfully!")
      }
    },
    saveNotesObj: () => {
      localStorage.setItem(moduleData.file, JSON.stringify(notesObj));
      methods.updateFileSize();
      console.log(moduleData.file, "saved.");
    },
    clearNotesObj: () => {
      notesObj = {};
      Object.assign(notesObj, noteTemplate);
      localStorage.removeItem(moduleData.file);
      self.sections().innerHTML = null;
      self.custom().innerHTML = null;
      methods.updateFileSize();
      methods.clearEditor();
    },
    confirm: (text, func) => {
      methods.setMessage(components.confirmMessage(text, func));
    },
    buildComponents: () => {
      methods.updateTitle();
      methods.updateFileSize();
      methods.loadSidebar();
    }
  };

  const slideMethods = {
    quickSort: (a,b) => parseFloat(a.id) - parseFloat(b.id),
    sortAll: () => {
      notesObj.sections.sort(slideMethods.quickSort);
      notesObj.sections.forEach(s => s.items.sort(slideMethods.quickSort));
    },
    findSectionInMenu: (element) => {
      let section = element.querySelector("[notes-section-id]");
      return section !== null
        ? section
        : slideMethods.findSectionInMenu(element.parentNode);
    },
    findSlideInMenu: () => select(".listitem.cs-selected"),
    createNote: () => {
      let currentSlide = slideMethods.findSlideInMenu();
      let currentSection = slideMethods.findSectionInMenu(currentSlide);

      let slideData = {
        id: currentSlide.getAttribute("notes-slide-id"),
        title: currentSlide.getAttribute("title"),
        note: ""
      };

      let sectionData = {
        id: currentSection.getAttribute("notes-section-id"),
        title: currentSection.getAttribute("title")
      };
      
      let section = notesObj.sections.find(s => s.id == sectionData.id);
      // If section exists
      if (section != undefined) {
        let slide = section.items.find(s => s.id == slideData.id);
        // If doesn't exists
        if (slide == undefined) {
          section.items.push(slideData);
          methods.loadSidebar();
        }
      }
      // If section doesn't exist
      else {
        sectionData.items = [];
        sectionData.items.push(slideData);
        notesObj.sections.push(sectionData);
        methods.loadSidebar();
      }

      let button = select(`#notes-frame #sidebar #sections button#s-${sectionData.id}`);
          button.classList.add("active");

      let dropdown = select(`#notes-frame #sidebar #sections .dropdown#s-${sectionData.id}`);
          dropdown.classList.add("active");

      let subButton = select(`#notes-frame #sidebar #sections #s-${sectionData.id} #s-${slideData.id}`);
          subButton.classList.add("active");

      methods.setDropdownHeight(dropdown);
      methods.loadNote(sectionData.id, methods.findNoteByIds(sectionData.id, slideData.id));
      self.textarea().focus();
      methods.clearMessage();
    }
  };

  const exportHTML = () => {
    let sections = () => {
      let sectionHTML = "";
      for (item of notesObj.sections) {
        sectionHTML += section(item);
      }
      return sectionHTML;
    };

    let section = (data) => `
      <div class="section">
        <h2>${data.title}</h2>
        <div>
          ${data.items.reduce((sum, e) => sum += slide(e), "")}
        </div>
      </div>
    `;

    let slide = (data) => `
      <div class="slide">
        <h3>${data.title}</h3>
        <hr />
        <p>${data.note}</p>
      </div>
    `;

    let html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8"/>
          <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
          <title>${moduleData.file}</title>
          <style type="text/css" media="print">
            :root { font-family: "Open Sans", Arial, sans-serif; font-size: 16px; }
            @page { size: A4 portrait; margin: 0.25in; }
            * { box-sizing: border-box; }
            body { margin: 0; }
            header { color: #353535; }
            .section { border-top: 1px dashed #353535; }
            .slide { 
              padding: 0 0.125in;
              border: 2px solid #ccc;
              margin: 0.125in;
            }
            img { max-width: 100%; }
          </style>
        </head>
        <body>
          <header>
            <h1>${moduleData.course} Module ${moduleData.module}: ${moduleData.title}</h1>
          </header>
          <main>
            ${sections()}
            ${notesObj.custom.items.length ? section(notesObj.custom) : ""}
          </main>
        </body>
      </html>
    `;

    let myWindow = window.open("","_blank","width=1000, height=500");
        myWindow.document.write(html);
        myWindow.document.close();
        myWindow.focus();
        
    myWindow.addEventListener("load", () => {
      myWindow.print();
      myWindow.close();
    });
  };

  return publicMethods = {
    init: () => {
      if (!initialized) {
        let sections = selectAll("nav div[data-is-scene='true']");
        sections.forEach((section, sectionIndex) => {
          section.setAttribute("notes-section-id", sectionIndex);
          section.parentNode.querySelectorAll("ul li > div.cs-listitem")
            .forEach((slide, slideIndex) => {
              slide.setAttribute("notes-slide-id", slideIndex);
            });
        });
        initialized = true;
      }

      let frame = create("div", template);
          frame.id = "notes-frame";

      target.insertBefore(frame, target.firstChild);

      let style = create("style");
          style.appendChild(document.createTextNode(css));

      self.frame().insertBefore(style, self.frame().firstChild);
      self.version().innerHTML = `Notes Tool ${version}`;

      methods.loadNotesObj();
      methods.buildComponents();
      methods.setMessage(components.selectNoteMessage());
      self.sidebar().appendChild(components.newNoteButton());
      
      click(select("#menu"), methods.makeDropdown);

      select("#notes-frame #textarea").addEventListener("blur", methods.saveNote);

      select("#notes-frame #title").addEventListener("mousedown", (e) => {
        let event = e || window.event;
        mouseData.posX = event.clientX;
        mouseData.posY = event.clientY;
        mouseData.difX = mouseData.posX - select("#notes-frame").offsetLeft;
        mouseData.difY = mouseData.posY - select("#notes-frame").offsetTop;
        mouseData.dragging = true;
      });

      target.addEventListener("mouseup", () => {
        mouseData.dragging = false;
      });

      target.addEventListener("mousemove", (e) => {
        let event = e || window.event;
        if (mouseData.dragging) {
          let frame = select("#notes-frame");
          mouseData.posX = event.clientX;
          mouseData.posY = event.clientY;
          frame.style.left = (mouseData.posX - mouseData.difX) + "px";
          frame.style.top = (mouseData.posY - mouseData.difY) + "px";
        }
      });

      click(select("#export"), exportHTML);

      click(select("#clear-all"), () => {
        let text = `Are you sure you want to delete all notes for<br />${notesObj.course} Module ${notesObj.module}?`;
        methods.confirm(text, methods.clearNotesObj);
      });
      click(select("#clear"), () => {
        if (self.textarea().innerHTML.length) methods.confirm("Are you sure you want to clear this note?", methods.clearTextarea);
      });
      click(select("#close"), publicMethods.close);

      click(select("#notes-frame #bold"), format("bold"));
      click(select("#notes-frame #italic"), format("italic"));
      click(select("#notes-frame #underline"), format("underline"));
    },
    close: () => select("#notes-frame").remove()
  };
}

document.querySelector("#notes-frame") == undefined ? notesTool().init() : notesTool().close();