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
  this.computable = ({
    menuDepth: s => s['aria-labelledby'].replace('outline-','')[0],
    slideReference: () => this.modleData.player.GetVar('slideReference'), // Returns eg. 1.2
    slideNote: () => this.moduleData.player.GetVar('note'),
    dataReference: s => s['data-ref'],
    getTitle: s => s['data-slide-title'],
    slideNumber: () => {
      let slide = this.privateMethods.findSlideInMenu().parentNode;
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
    recursiveSectionGet: s => {
      if (this.computable.menuDepth(s) == '1') {
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
      if (this.computable.menuDepth(s) == '1') {
        return p;
      } else {
        let find = document.querySelector(`#${s['aria-labelledby']}`);
        p.push(this.computable.getTitle(find));
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
    appendNoteInMenu: (section,slide) => {},
    createNote: () => {
      let slideData = {
        id: this.computable.slideReference(),
        ref: this.computable.dataReference(this.privateMethods.findSlideInMenu()),
        parent_titles: this.privateMethods.getParentTitles(),
        title: this.computable.getTitle(this.privateMethods.findSlideInMenu()),
        number: this.computable.slideNumber(),
        note: this.computable.slideNote()
      };
      this.notesObj.sections[sectionNumber].push(slideData); // !! Need to define sectionNumber !!
      //
      //
      //
      // Create Section if it doesn't exist
      //
      //
      //
    },
    saveNotes: () => localStorage.setItem(
      this.moduleData.mod,
      JSON.stringify(this.notesObj)
    )
  });

  // Methods to be called publically
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
      let slide = this.privateMethods.findSlideInMenu();
      let data = {

      }
      // if note exists
      this.privateMethods.createNote();
      // else
      this.privateMethods.updateNote();
      this.privateMethods.sortAll();
      this.privateMethods.saveNotes();
    },
    getModData: () => this.moduleData // Testing function
  })
}