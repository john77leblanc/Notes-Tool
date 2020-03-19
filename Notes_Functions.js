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

// Notes Object
const notesFunctions = () => {
  this.moduleData = ({
    player: GetPlayer(),
    get: v => this.moduleData.player.GetVar(v),
    set: (set,data) => this.moduleData.player.SetVar(set,data),
    title: () => this.moduleData.get("Module_Title"),
    modNum: () => this.moduleData.get("Module"),
    courseCode: () => this.moduleData.get("Course_Code"),
    mod: () => `${this.moduleData.courseCode()}_${this.moduleData.modNum()}_notes`
  });

  this.state = {
    notesObj: {
      title: this.moduleData.title(),
      module: this.moduleData.modNum(),
      sections: []
    },
    initialized: false
  };

  // Return computed string variables
  this.computed = ({
    menuDepth: s => s.getAttribute('aria-labelledby').replace('outline-','')[0],
    slideReference: () => parseInt(this.moduleData.get('slideReference').replace(/.*\./g, ""))-1,
    slideNote: () => this.moduleData.get("Notes").trim(),
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
      this.state.notesObj.sections.forEach(e => {
        if (e.slides.length) e.slides.forEach(s => this.privateMethods.appendNoteInMenu(s));
      });
    },
    findSlideInMenu: () => document.querySelector('.cs-selected'), // Find the highlighted slide in the menu
    findSlideInMenuByRef: ref => document.querySelector(`[data-ref="${ref}"]`),
    findSectionInMenu: () => {
      let slide = this.privateMethods.getParentUL(this.privateMethods.findSlideInMenu())
      return document.querySelector(`#${this.privateMethods.recursiveSectionGet(slide).getAttribute('aria-labelledby')}`);
    },
    findSectionById: id => this.state.notesObj.sections.find(e => e.id == id),
    findSlideByIds: (sectionId, slideId) => this.privateMethods.findSectionById(sectionId).slides.find(e => e.id == slideId),
    recursiveSectionGet: s => {
      if (this.computed.menuDepth(s) == '1') {
        return s;
      } else {
        this.privateMethods.recursiveSectionGet(this.privateMethods.getParentUL(s));
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
        if (typeof a.slides != 'undefined') a.slides.sort(this.privateMethods.mySort)
      });
    },
    appendNoteInMenu: s => {
      let note = ' [Note]';
      let menu = this.privateMethods.findSlideInMenuByRef(s.ref);
      if (s.note.length) {
        menu.innerHTML += menu.innerHTML.includes(note) ? '' : note;
      } else {
        menu.innerHTML = menu.innerHTML.replace(note, '');
      }
    },
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
      
      // Remove note if there is none
      if (!slideData.note.length) this.privateMethods.removeNote(sectionId, slideData.id);
      // Add note
      else {
        // If section exists
        if (this.state.notesObj.sections.length && this.privateMethods.findSectionById(sectionId)) {
          // If slide exists
          if (this.privateMethods.findSectionById(sectionId).slides.length 
              && this.privateMethods.findSlideByIds(sectionId,slideData.id)) {
                this.privateMethods.findSlideByIds(sectionId, slideData.id).note = slideData.note;
          }
          // If slide doesn't exist
          else {
            this.state.notesObj.sections.find(e => e.id == sectionId).slides.push(slideData);
          }
        }
        // If section doesn't exist
        else {
          let section = this.privateMethods.createSection(slideData)
          this.state.notesObj.sections.push(section);
        }
      }
      this.privateMethods.appendNoteInMenu(slideData);
    },
    removeNote: (sectionId, slideId) => {
      let section = this.privateMethods.findSectionById(sectionId);
      let slide = this.privateMethods.findSlideByIds(sectionId, slideId);
      let index = section.slides.indexOf(slide);
      this.privateMethods.findSectionById(sectionId).slides.splice(index,1);
      if (!this.privateMethods.findSectionById(sectionId).slides.length) {
        index = this.state.notesObj.sections.indexOf(section);
        this.state.notesObj.sections.splice(index,1);
      }
    },
    loadNote: () => {
      let sectionId = this.computed.sectionReference(this.privateMethods.findSectionInMenu());
      let slideId = this.computed.slideReference();
      if (typeof this.privateMethods.findSectionById(sectionId) != 'undefined') {
        let data = this.privateMethods.findSlideByIds(sectionId, slideId);
        if (typeof data != 'undefined') this.moduleData.set('Notes', data.note);
        else this.moduleData.set('Notes','');
      } else this.moduleData.set('Notes','');
    },
    saveNotes: () => localStorage.setItem(
      this.moduleData.mod(),
      JSON.stringify(this.state.notesObj)
    )
  });

  // Methods to be called publicly
  return this.publicMethods = ({
    initNotesObject: () => {
      if (!this.state.initialized) {
        // Attempt to load notes object from local storage
        this.privateMethods.loadNotes();
        this.state.initialized = true;
        this.privateMethods.sortAll();
      }
    },
    loadNote: () => {
      this.privateMethods.loadNote();
    },
    editNote: () => {
      this.privateMethods.createNote();
      this.privateMethods.sortAll();
      this.privateMethods.saveNotes();
    },
    compileNotes: () => {
      let compile = "";
      this.state.notesObj.sections.forEach(e => {
        compile += "---------------------------------------------------------\n";
        compile += "|  " + e.title + "\n";
        compile += "---------------------------------------------------------\n\n"
        e.slides.forEach(s => {
          if (s.parent_titles.length) {
            compile += "Sub-slide " + s.title + "\n";
            compile += "(From: ";
            s.parent_titles.forEach(t => {
              compile += t;
              if (s.parent_titles.indexOf(t) != s.parent_titles.length - 1) compile += " > ";
            });
            compile += ")\n"
          } else {
            compile += "Slide " + s.title + "\n";
          }
          compile += s.note + "\n\n";
        });
      });
      this.moduleData.set('Compile', compile)
    }
  })
}

window.addEventListener('load', () => window.notes = notesFunctions());