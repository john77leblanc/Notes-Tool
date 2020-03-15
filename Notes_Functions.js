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
  get: v => this.player.GetVar(v),
  title: this.get("Module_Title"),
  modNum: this.get("Module"),
  courseCode: this.get("Course_Code"),
  mod: `${this.courseCode}_${this.modNum}_notes`
});

// Notes Object
const notesObject = () => {
  this.moduleData = {
    __proto__: moduleData()
  }

  this.state = {
    notesObj: {
      __proto__: noteObjectTemplate
    },
    initialized: false
  }

  // Return computed string variables
  this.computed = ({
    menuDepth: s => s['aria-labelledby'].replace('outline-','')[0],
    slideReference: () => parseInt(this.modleData.player.GetVar('slideReference').replace(/.*\./g, ""))-1,
    slideNote: () => this.moduleData.player.GetVar('note'),
    dataReference: s => s['data-ref'],
    sectionReference: s => s['id'].replace('outline-1-',''),
    getTitle: s => s['data-slide-title'],
    getNumber: s => {
      let slide = s.parentNode;
      let nodes = Array.prototype.slice.call(slide.parentNode);
      return `${nodes.indexOf(slide)+1} of ${nodes.length}`;
    }
  })

  this.privateMethods = ({
    loadNotes: () => {
      let obj = JSON.parse(localStorage.getItem(this.moduleData.mod));
      this.state.notesObj = obj != null 
        ? obj 
        : Object.assign(
          {},
          {
            title: this.moduleData.title,
            module: this.moduleData.modNum
          }
      );
    },
    findSlideInMenu: () => document.querySelector('.cs-selected'), // Find the highlighted slide in the menu
    findSectionInMenu: () => {
      let slide = this.privateMethods.findSlideInMenu().parentNode.parentNode; // Gets <ul>
      return this.privateMethods.recursiveSectionGet(slide);
    },
    findSectionById: id => this.notesObj.sections.find(e => e.id == id),
    findSlideByIds: (sectionId, slideId) => this.notesObj.sections[sectionId].slides.find(e => e.id == id),
    recursiveSectionGet: s => {
      if (this.computed.menuDepth(s) == '1') {
        return s;
      } else {
        this.privateMethods.recursiveParentGet(s.parentNode.parentNode);
      }
    },
    getParentTitles: () => {
      let parents = [];
      let slide = this.privateMethods.findSlideInMenu().parentNode.parentNode; // Gets <ul>
      return this.privateMethods.recursiveParentGet(parents,slide).reverse();
    },
    recursiveParentGet: (p,s) => {
      if (this.computed.menuDepth(s) == '1') {
        return p;
      } else {
        let find = document.querySelector(`#${s['aria-labelledby']}`);
        p.push(this.computed.getTitle(find));
        this.privateMethods.recursiveParentGet(p,s.parentNode.parentNode);
      }
    },
    mySort: (a,b) => parseFloat(a.id) - parseFloat(b.id),
    sortSectionById: id => {
      this.notesObj.sections.find(e => e.id == id)
          .slides.sort(this.privateMethods.mySort)
    },
    sortAll: () => {
      // Sort Sections
      this.notesObj.sections.sort(this.privateMethods.mySort);
      // Sort Slides
      this.notesObj.sections.forEach(a => a.slides.sort(this.privateMethods.mySort));
    },
    appendNoteInMenu: (section,slide) => {}, // !! Need to finish ///////////////////////////////////////////
    createSection: (note = false) => {
      let s = this.privateMethods.findSectionInMenu();
      let section = {
        id: this.computed.sectionReference(s),
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
      if (this.notesObj.sections.length && this.privateMethods.findSectionById(sectionId)) {
        this.notesObj.sections[sectionId].push(slideData);
        // If slide exists
        if (this.notesObj.sections[sectionId].slides.length 
            && this.privateMethods.findSlideByIds(sectionId,slideData.id)) {
              this.notesObj.sections[sectionId].slides[slideData.id].note = slideData.note;
        }
        // If slide doesn't exist
        else {
          this.notesObj.sections[sectionId].slides.push(slideData);
        }
      }
      // If section doesn't exist
      else {
        this.notesObj.sections.push(this.privateMethods.createSection(slideData));
      }
    },
    saveNotes: () => localStorage.setItem(
      this.moduleData.mod,
      JSON.stringify(this.notesObj)
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

        // Sort for menu
        this.privateMethods.sortAll();
      } else {
        return null;
      }
    },
    editNote: () => {
      this.privateMethods.createNote();
      this.privateMethods.sortAll();
      this.privateMethods.saveNotes();
    },
    getModData: () => this.moduleData // Testing function
  })
}