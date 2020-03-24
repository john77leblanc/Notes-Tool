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
  this.static = ({
    menuDepth: "menu-depth",
    menuDepthVal: "2",
    noteId: "notes-id",
    noteRef: "notes-reference",
    noteRefId: "notes-reference-id",
    sectionRef: "section-reference"
  });

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
    currentStorylineMod: () => this.moduleData.get('Module_Set'),
    menuDepth: s => s.getAttribute(this.static.menuDepth),
    slideReference: s => s.getAttribute(this.static.noteId),
    slideNote: () => this.moduleData.get("Notes").trim(),
    dataReference: s => s.getAttribute('data-ref'),
    sectionReference: s => s.getAttribute(this.static.sectionRef),
    getTitle: s => s.getAttribute('data-slide-title'),
    getNumber: s => {
      let slide = s.parentNode;
      let nodes = Array.prototype.slice.call(slide.parentNode.childNodes, slide);
      return `${nodes.indexOf(slide)+1} of ${nodes.length}`;
    }
  })

  this.privateMethods = ({
    calcDepth: (e, depth = 1) => {
      let item = e.parentNode;
      return item.nodeName == 'NAV' 
        ? depth 
        : this.privateMethods.calcDepth(this.privateMethods.getParentUL(e), depth + 1);
    },
    setDepth: () => {
      document.querySelectorAll('nav ul').forEach(e => {
        e.setAttribute(this.static.menuDepth, this.privateMethods.calcDepth(e));
      });
    },
    setSectionReferences: () => {
      document.querySelectorAll(`[${this.static.menuDepth}="${this.static.menuDepthVal}"]`).forEach((e,i) => {
        e.previousElementSibling.setAttribute(this.static.sectionRef, i);
      });
    },
    setNoteReferences: () => {
      document.querySelectorAll('nav ul li > div').forEach((e,i) => {
        e.setAttribute(this.static.noteId, i);
      });
    },
    setAriaLabels: () => {
      document.querySelectorAll('nav [aria-labelledby]').forEach((e,i) => {
        e.setAttribute(this.static.noteRef, i);
        if (e.previousElementSibling != null) {
          e.previousElementSibling.setAttribute(this.static.noteRefId, i);
        }
      });
    },
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
      let slide = this.privateMethods.getParentUL(this.privateMethods.findSlideInMenu());
      let me = document.querySelector(
        `[${this.static.noteRefId}="${this.privateMethods.recursiveSectionGet(slide).getAttribute(this.static.noteRef)}"]`
      );
      return me;
    },
    findSectionById: id => this.state.notesObj.sections.find(e => e.id == id),
    findSlideByIds: (sectionId, slideId) => this.privateMethods.findSectionById(sectionId).slides.find(e => e.id == slideId),
    recursiveSectionGet: s => {
      return this.computed.menuDepth(s) == this.static.menuDepthVal
        ? s
        : this.privateMethods.recursiveSectionGet(this.privateMethods.getParentUL(s));
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
      if (this.computed.menuDepth(s) == this.static.menuDepthVal) {
        return p;
      } else {
        let find = document.querySelector(`[${this.static.noteRefId}="${s.getAttribute(this.static.noteRef)}"]`);
        p.push(this.computed.getTitle(find));
        return this.privateMethods.recursiveParentGet(p,this.privateMethods.getParentUL(s));
       }
    },
    mySort: (a,b) => parseFloat(a.id) - parseFloat(b.id), // Need to fix sorting issue
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
        id: this.computed.slideReference(s),
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
      let slideId = this.computed.slideReference(this.privateMethods.findSlideInMenu());
      if (typeof this.privateMethods.findSectionById(sectionId) != 'undefined') {
        let data = this.privateMethods.findSlideByIds(sectionId, slideId);
        if (typeof data != 'undefined') this.moduleData.set('Notes', data.note);
        else this.moduleData.set('Notes','');
      } else this.moduleData.set('Notes','');
    },
    saveNotes: () => localStorage.setItem(
      this.moduleData.mod(),
      JSON.stringify(this.state.notesObj)
    ),
    compileData: data => {
      let compile = "";
      data.sections.forEach(e => {
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
            compile += `${s.number} | ${s.title}\n`;
          }
          compile += s.note + "\n\n";
        });
      });
      this.moduleData.set('Compile', compile)
    }
  });

  this.exportTemplates = ({
    section: s => {
      return `
      <div>
        <h3 class="section">${s.title}</h3>
        ${s.slides.reduce((sum,e) => sum + (e.parent_titles.length ? this.exportTemplates.subSlide(e) : this.exportTemplates.slide(e)),"")}
      </div>`;
    },
    slide: s => {
      return `
      <div class="note">
        <h4 class="slide-title">${s.number} | ${s.title}</h4>
        ${this.exportTemplates.note(s.note)}
      </div>`;
    },
    subSlide: s => {
      return `
      <div class="note sub-slide">
        <h4 class="sub-slide-title">${s.number} | ${"&#8627; ".repeat(s.parent_titles.length)} ${s.title}</h4>
        ${this.exportTemplates.parentTitles(s.parent_titles)}
        ${this.exportTemplates.note(s.note)}
      </div>`;
    },
    parentTitles: titles => {
      return `
      <h5 class="sub-slide-appender">
        (From: ${titles.reduce((sum, t) => sum + titles.indexOf(t) == titles.length - 1 ? t : t + " > ","")})
      </h5>`;
    },
    note: n => `<p>${n}</p>`
  })

  // Methods to be called publicly
  return this.publicMethods = ({
    initNotesObject: () => {
      if (!this.state.initialized) {
        // Attempt to load notes object from local storage
        this.privateMethods.setDepth();
        this.privateMethods.setAriaLabels();
        this.privateMethods.setSectionReferences();
        this.privateMethods.setNoteReferences();
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
      let course = this.moduleData.courseCode();
      let num = this.computed.currentStorylineMod();
      let data = JSON.parse(localStorage.getItem(`${course}_${num}_notes`));
      this.privateMethods.compileData(data);
    },
    checkForOtherModules: () => {
      Object.entries(localStorage).filter(e => e[0].includes(this.moduleData.courseCode())).forEach(e => {
        let data = JSON.parse(localStorage.getItem(e[0]));
        this.moduleData.set(`Module_Review_${data.module}`, data.title);
      });
    },
    exportNotes: () => {
      let course = this.moduleData.courseCode();
      let num = this.moduleData.get('Module_Set');
      let data = JSON.parse(localStorage.getItem(`${course}_${num}_notes`));

      let compile = data.sections.reduce((sum, e) => sum + this.exportTemplates.section(e),"");

      let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${course}_Module_${num}_Notes</title>
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
              <div class='header-item' style='text-align: center;'><h2>${course}, Module ${num}</h2></div>
              <div class='header-item' style='text-align: right;'><h2>BHSc</h2></div>
            </div>
            <h1 style='text-align: center;'>${data.title}</h1>
          </div>
          <div id="print-note" style="padding: 15px; margin-bottom: 0px; background: #eeeeee; text-align: center;">
            <p>Here is a compiled version of all your notes for this module. You cannot edit this page. It is recommended that you print or save this page to mitigate the risk of losing your notes. Remember, notes taken with this tool are linked specifically to the device you are currently on, and will not appear if you use a different device (laptop, computer, etc.).</p>
            <div style="width: 200px; margin: auto;"><button onclick="MyPrint();" style="width: 100%;">Export</button></div>
          </div>
          <div>
            ${compile}
          </div>
        </body>
      </html>
      `;

      let myWindow = window.open("","_blank", "width=850");
      myWindow.document.write(html);
    }
  })
}

window.addEventListener('load', () => window.notes = notesFunctions());