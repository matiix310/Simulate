var datas = [];

function getCoefs() {

    var coefsDOM = $('td.coef span');
    for (let i=0; i<coefsDOM.length; i++) {
        coefsDOM[i] = coefsDOM[i].innerHTML;
    }

    return coefsDOM;
}

function getNames() {
    var nomsMatiere = $('.discipline .nommatiere b');
    for (let i=0; i<nomsMatiere.length; i++) {
        nomsMatiere[i] = nomsMatiere[i].innerHTML;
    }

    return nomsMatiere;
}

function getNotes() {
    var notesList = [];
    var notes = $('td.notes');
    for (let i=0; i<notes.length; i++) {
        var tempNotes = [];
        

        var tempNotes = notes[i].querySelectorAll('.valeur');
        var notesToPush = [];
        tempNotes.forEach(note => {
            notesToPush.push(note.textContent.replaceAll(' ', ''));
        })

        notesList.push(notesToPush);
    }

    return notesList;
}

function getDatas() {
    const names = getNames();
    const coefs = getCoefs();
    const notes = getNotes();

    for (let i=0; i<names.length; i++) {

        notesObj = [];

        notes[i].forEach(note => {
            let coef = '1';
            let sur = '20';

            if (note.indexOf('(') >= 0) {
                coef = note.slice(note.indexOf('(')+1, note.length-1);
                note = note.slice(0, note.indexOf('('));
            }

            if (note.indexOf('/') >= 0) {
                sur = note.slice(note.indexOf('/')+1, note.length);
                note = note.slice(0, note.indexOf('/'));
            }

            let value = note;

            notesObj.push({
                "value": value,
                "sur": sur,
                "coef": coef
            })
        })

        var matiere = {
            "name": names[i],
            "coef": coefs[i],
            "notes": notesObj
        }

        if (notes[i].length != 0) datas.push(JSON.stringify(matiere));
    }

    console.log(datas);
    // return datas;
}

getDatas();
chrome.runtime.sendMessage({ message: "notesDatas", data: datas.join("SEPA").replaceAll('&amp;', 'ET') });