////////////////////////
//  Object Templates
////////////////////////

const noteObjectTemplate = {
  title: '',
  module: '',
  sections: []
}

const sectionTemplate = {
  id: '',
  title: '',
  number: '',
  slides: []
}

const slideTemplate = {
  id: '',
  ref: '',
  parent_titles: [],
  title: '',
  number: '',
  note: ''
}

////////////////////////
//  Objects
////////////////////////

// Module Data Object
const moduleData = () => ({
  player: GetPlayer(),
  get: v => {this.player.GetVar(v)},
  title: function() {this.get("Module_Title")},
  modNum: function() {this.get("Module")},
  courseCode: function() {this.get("Course_Code")},
  mod: function() {`${this.courseCode()}_${this.modNum()}_notes`}
});

// Notes Object
function notesFunctions() {
  this.state = {
    notesObj: {
      __proto__: noteObjectTemplate
    },
    initialized: false
  };

  this.moduleData = ({
    player: GetPlayer(),
    get: v => this.moduleData.player.GetVar(v),
    title: () => this.moduleData.get("Module_Title"),
    modNum: () => this.moduleData.get("Module"),
    courseCode: () => this.moduleData.get("Course_Code"),
    mod: () => `${this.moduleData.courseCode()}_${this.moduleData.modNum()}_notes`
  });

  // Return computed string variables
  this.computed = ({
    menuDepth: s => s.getAttribute('aria-labelledby').replace('outline-','')[0],
    slideReference: () => parseInt(this.moduleData.get('slideReference').replace(/.*\./g, ""))-1,
    slideNote: () => this.moduleData.get("Notes"),
    dataReference: s => s.getAttribute('data-ref'),
    sectionReference: s => s.getAttribute('id').replace('outline-1-',''),
    getTitle: s => s.getAttribute('data-slide-title'),
    getNumber: s => {
      let slide = s.parentNode;
      let nodes = Array.prototype.slice.call(slide.parentNode.childNodes, slide);
      return `${nodes.indexOf(slide)+1} of ${nodes.length}`;
    }
  })

  this.privateMethods = ({
    loadNotes: () => {
      let obj = JSON.parse(localStorage.getItem(this.moduleData.mod()));
      this.state.notesObj = obj != null 
        ? obj 
        : ({
            title: this.moduleData.title(),
            module: this.moduleData.modNum(),
            sections: []
          });
    },
    findSlideInMenu: () => document.querySelector('.cs-selected'), // Find the highlighted slide in the menu
    findSlideInMenuById: id => document.querySelector(`[data-ref="${id}"]`),
    findSectionInMenu: () => {
      let slide = this.privateMethods.getParentUL(this.privateMethods.findSlideInMenu())
      return this.privateMethods.recursiveSectionGet(slide);
    },
    findSectionById: id => this.state.notesObj.sections.find(e => e.id == id),
    findSlideByIds: (sectionId, slideId) => this.state.notesObj.sections[sectionId].slides.find(e => e.id == id),
    recursiveSectionGet: s => {
      if (this.computed.menuDepth(s) == '1') {
        return s;
      } else {
        this.privateMethods.recursiveParentGet(this.privateMethods.getParentUL(s));
      }
    },
    getParentUL: s => {
      let slide = s.parentNode;
      return slide.nodeName == 'UL' ? slide : this.privateMethods.getParentUL(slide);
    },
    getParentTitles: () => {
      let parents = [];
      let slide = this.privateMethods.getParentUL(this.privateMethods.findSlideInMenu());
      return this.privateMethods.recursiveParentGet(parents,slide).reverse();
    },
    recursiveParentGet: (p,s) => {
      if (this.computed.menuDepth(s) == '1') {
        return p;
      } else {
        let find = document.querySelector(`#${s.getAttribute('aria-labelledby')}`);
        p.push(this.computed.getTitle(find));
        this.privateMethods.recursiveParentGet(p,this.privateMethods.getParentUL(s));
      }
    },
    mySort: (a,b) => parseFloat(a.id) - parseFloat(b.id),
    sortSectionById: id => {
      this.state.notesObj.sections.find(e => e.id == id)
          .slides.sort(this.privateMethods.mySort)
    },
    sortAll: () => {
      // Sort Sections
      this.state.notesObj.sections.sort(this.privateMethods.mySort);
      // Sort Slides
      this.state.notesObj.sections.forEach(a => {
        if (typeof(a.slides) != 'undefined') a.slides.sort(this.privateMethods.mySort)
      });
    },
    appendNoteInMenu: s => {
      let note = ' [Note]';
      let menu = this.privateMethods.findSlideInMenuById(s.id);
      if (s.note.length) {
        menu.innerHTML += menu.innerHTML.includes(note) ? '' : note;
      } else {
        menu.innerHTML = menu.innerHTML.replace(note, '');
      }
    },
    createSection: (note = false) => {
      let s = this.privateMethods.findSectionInMenu();
      let section = {
        id: this.computed.sectionReference(s), // Not working as intended
        title: this.computed.getTitle(s),
        number: this.computed.getNumber(s),
        slides: []
      };
      if (note) section.slides.push(note);
      return section;
    },
    createNote: () => {
      let s = this.privateMethods.findSlideInMenu();
      let slideData = {
        id: this.computed.slideReference(),
        ref: this.computed.dataReference(s),
        parent_titles: this.privateMethods.getParentTitles(),
        title: this.computed.getTitle(s),
        number: this.computed.getNumber(s),
        note: this.computed.slideNote()
      };
      let sectionId = this.computed.sectionReference(this.privateMethods.findSectionInMenu());
      // If section exists
      if (this.state.notesObj.sections.length && this.privateMethods.findSectionById(sectionId)) {
        this.state.notesObj.sections[sectionId].push(slideData);
        // If slide exists
        if (this.state.notesObj.sections[sectionId].slides.length 
            && this.privateMethods.findSlideByIds(sectionId,slideData.id)) {
              this.state.notesObj.sections[sectionId].slides[slideData.id].note = slideData.note;
        }
        // If slide doesn't exist
        else {
          this.state.notesObj.sections[sectionId].slides.push(slideData);
        }
      }
      // If section doesn't exist
      else {
        this.state.notesObj.sections.push(this.privateMethods.createSection(slideData)); // ERROR SECTION
      }
    },
    loadNote: () => {
      let sectionId = this.computed.sectionReference(this.privateMethods.findSectionInMenu());
      let ref = this.computed.slideReference();
    },
    saveNotes: () => localStorage.setItem(
      this.moduleData.mod(),
      JSON.stringify(this.state.notesObj)
    )
  });

  // Methods to be called publicly
  return this.publicMethods = ({
    // Initialize Notes Object and Player Menu
    initNotesObject: () => {
      if (!this.state.initialized) {
        // Attempt to load notes object from local storage
        this.privateMethods.loadNotes();
        this.state.initialized = true;
        this.privateMethods.sortAll();
      }
    },
    loadNote: () => {

    },
    editNote: () => {
      this.privateMethods.createNote();
      // this.privateMethods.sortAll();
      // this.privateMethods.saveNotes();
    },
    getModData: () => this.moduleData // Testing function
  })
}