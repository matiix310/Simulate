console.log('Lancement de la simulation...');

// icon pour les matières
const icons = {
    "MATHEMATIQUES": "fa-square-root-alt",
    "HISTOIRE-GEOGRAPHIE": "fa-globe-africa",
    "ANGLAIS LV1": "fa-flag-usa",
    "PHYSIQUE-CHIMIE": "fa-flask",
    "ALLEMAND LV2": "fa-beer",
    "ED.PHYSIQUE ET SPORT.": "fa-volleyball-ball",
    "ENS. MORAL ET CIVIQUE": "fa-landmark",
    "ANGLAIS LV SECTION": "fa-pound-sign",
    "MATHS EXPERTES": "fa-superscript",
    "SVT - Ens. Scientifique" : "fa-seedling",
    "SCIENCES VIE ET TERRE" : "fa-bacterium",
    "LCA LATIN" : "fa-theater-masks",
    // "MATHS COMPLEMENTAIRE" : "",
    "PC - Ens. Scientifique": "fa-recycle",
}

// create all DOM element
var matiereDOM = '<div class="matiere" name="NAME"><div class="icon"><div class="iconContainer"><span class="label">NAME</span><i class="fas"></i></div></div><div class="notes"></div><div class="moyenne"><h1 coef="COEF">00</h1><i class="fas fa-sort-up up"></i><i class="fas fa-sort-down down"></i></div></div>';
var noteDOM = '<div class="note" state="visible"><h1>NOTE<span>/SUR</span></h1><div class="coef" coef="COEF"></div></div>';


// get datas from URI
var querydatas = window.location.search
querydatas = decodeURI(querydatas);
const urlDatas = new URLSearchParams(querydatas);
var strDatas = urlDatas.get('datas');
strDatas = decodeURI(strDatas).split('SEPA');

var datas = [];
// convert string to object
strDatas.forEach(matiere => {
    datas.push(JSON.parse(matiere));
})

loadDatas(datas);

function loadDatas(_datas) {

    datas = _datas;

    // cleare table
    $('#tableContent').empty();

    console.log("Loading datas...")
    // display datas
    console.log(_datas);

    _datas.forEach(matiere => {
        // index de la matiere
        const index = _datas.indexOf(matiere);

        // ajouter la matiere dans le tableau
        if (matiere.name == "SVT - Ens. Scientifique" || matiere.name == "PC - Ens. Scientifique") matiere.coef = "2.5";
        $('#tableContent').append(matiereDOM.replace('COEF', matiere.coef).replaceAll('NAME', matiere.name));
        let maxCoef = 0;
        matiere.notes.forEach(note => {
            if (note.coef > maxCoef) maxCoef = note.coef
        })
        matiere.notes.forEach(note => {
            var noteNode = noteDOM.replace('NOTE', note.value).replace('SUR', note.sur).replace('COEF', note.coef);

            if (note.state == 'hidden') noteNode = noteNode.replace('visible', 'hidden');

            $('.matiere .notes').last().append(noteNode);
            
            if (note.state == 'hidden') $('.matiere .notes').last().children().last().css('opacity', '.5');

            // calcul du coef
            $('.matiere .notes').last().children().last().children(".coef")[0].style.width = (parseFloat(note.coef)/maxCoef)*100 + '%';
        })

        // mise en forme des extremes (notes) et calcule de la moyenne
        noteExtreme(index);
        computeMean(index);
    })

    // ajout des icons
    setIcons();

    // mise en forme des extremes (moyennes)
    meanExtreme();

    // calcule de la moyenne générale
    if (_datas[0].baseCoef) {
        $('#moyenneG').attr('start', datas[0].baseCoef);
        computeGlobalMean();
    } else computeGlobalMean(true);
}


function getMatiereNames() {
    var names = datas.map(item => {
        return item.name;
    })

    return names;
}


// { name: 'NOM MATIERE', coef: '5' }
function getMatieres() {
    let names = getMatiereNames();
    let means = getMeans();

    let matieres = [];

    for (let i=0; i<names.length; i++) {
        matieres.push({
            name: names[i],
            coef: means[i].coef,
        });
    }

    return matieres;
}


function getNotes(index, abs = true) {
    var notesDOM = $('.matiere .notes')[index].childNodes;
    var notes = [];

    notesDOM.forEach(note => {
        let absState = "present";
        if (note.textContent.startsWith('Abs')) absState = "absent";

        if (abs) {
            notes.push({
                value: note.textContent.slice(0, note.textContent.indexOf('/')),
                sur: note.textContent.slice(note.textContent.indexOf('/')+1),
                coef: note.childNodes[1].getAttribute('coef'),
                state: note.getAttribute('state'),
                abs: absState
            });
        } else if (absState == "present") {
            notes.push({
                value: note.textContent.slice(0, note.textContent.indexOf('/')),
                sur: note.textContent.slice(note.textContent.indexOf('/')+1),
                coef: note.childNodes[1].getAttribute('coef'),
                state: note.getAttribute('state'),
                abs: absState
            });
        }
    })

    // { value: "15,6", sur: "10", coef: "1"}
    return notes;
}

function getMeans() {
    var meansDOM = $('.matiere .moyenne h1');
    var means = [];

    meansDOM.each((_index, mean) => {
        means.push({
            value: mean.textContent,
            coef: mean.getAttribute('coef')
        });
    });

    // { value: "15,6", coef: "1" }
    return means;
}


function noteExtreme(index) {
    var notesDOM = $('.matiere .notes')[index].childNodes;
    var notes = getNotes(index);

    // reset des couleurs
    notesDOM.forEach(note => {
        note.classList.remove('green');
        note.classList.remove('red');
    })

    // calcule de la max et min
    var min = 2;
    var maxIndex = [];
    var max = 0;
    var minIndex = [];

    notes.forEach(note => {

        if (note.state == "visible" && note.abs == "present") {
            if (parseFloat(note.value)/parseFloat(note.sur) > max) {
                maxIndex = [notes.indexOf(note)];
                max = parseFloat(note.value)/parseFloat(note.sur);

            } else if (parseFloat(note.value)/parseFloat(note.sur) == max) {
                maxIndex.push(notes.indexOf(note));

            } else if (parseFloat(note.value)/parseFloat(note.sur) < min) {
                minIndex = [notes.indexOf(note)];
                min = parseFloat(note.value)/parseFloat(note.sur);

            } else if (parseFloat(note.value)/parseFloat(note.sur) == min) {
                minIndex.push(notes.indexOf(note));
            }
        }
    })

    // editer les fonds en rouge / vert
    if (min == 2 || max == 0 || min==max || notesDOM.length == 2) return;
    

    maxIndex.forEach(noteIndex => { notesDOM[noteIndex].classList.add('green'); })
    minIndex.forEach(noteIndex => { notesDOM[noteIndex].classList.add('red'); })
}


function computeMean(index) {
    var moyenneDOM = $('.moyenne h1')[index];
    var notes = getNotes(index);

    var sum = 0;
    var coefsSum = 0;

    notes.forEach(note => {
        if (note.state == "visible" && note.abs == "present") {
            note.value = note.value.replace(',', '.')
            if (parseFloat(note.sur) == 20) sum += parseFloat(note.value)*parseFloat(note.coef);
            else sum += (parseFloat(note.value)/parseFloat(note.sur))*20*parseFloat(note.coef);
            coefsSum += parseFloat(note.coef);
        }
    })
    var mean = Math.round((sum/coefsSum)*100)/100

    if (isNaN(mean)) {
        moyenneDOM.innerHTML = "--";
    } else moyenneDOM.innerHTML = mean.toString().replace('.', ',');

    meanExtreme();
}

function meanExtreme() {
    var meansDOM = $('.matiere .moyenne')
    var means = getMeans();

    var max = 0;
    var maxIndex = [];
    var min = 25;
    var minIndex = [];

    means.forEach(mean => {
        if (mean.value != "--") {
            var index = means.indexOf(mean);
            mean.value = mean.value.replace(',', '.');
            mean.coef = mean.coef.replace(',', '.');

            var value = parseFloat(mean.value);

            if (value > max) {
                max = value;
                maxIndex = [index];
            } else if (value == max) maxIndex.push(index);
            else if (value < min) {
                min = value;
                minIndex = [index];
            } else if (value == min) minIndex.push(index);

            // reset des couleurs
            meansDOM[index].classList.remove('green')
            meansDOM[index].classList.remove('red')
        }
    });

    maxIndex.forEach(index => { meansDOM[index].classList.add('green') })
    minIndex.forEach(index => { meansDOM[index].classList.add('red') })
}


function computeGlobalMean(firstTime=false) {
    var means = getMeans();
    
    var sum = 0;
    var coefsSum = 0;

    means.forEach(mean => {
        if (mean.value != "--") {
            var value = parseFloat(mean.value.replace(',', '.'));
            var coef = parseFloat(mean.coef.replace(',', '.'));

            sum += value*coef;
            coefsSum += coef;
        }
    })

    var globalMean = Math.round((sum/coefsSum)*100)/100;

    $('#moyenneG').text(globalMean.toString().replace('.', ','));
    if (firstTime) $('#moyenneG').attr('start', globalMean.toString());

    // edit delta
    const startMean = parseFloat($('#moyenneG').attr('start'));
    if (globalMean > startMean) {
        // up
        let delta = Math.round((globalMean-startMean)*100)/100;
        $('#delta')[0].innerHTML = '+'+delta.toString();
        $('.moyenneGNote').removeClass('down').addClass('up');
    } else if (globalMean < startMean) {
        // down
        let delta = Math.round((startMean-globalMean)*100)/100;
        $('#delta')[0].innerHTML = '-'+delta.toString();
        $('.moyenneGNote').removeClass('up').addClass('down');
    } else {
        $('#delta').val('');
        $('.moyenneGNote').removeClass('up down');
    }
}

function computeCoef(index) {
    // calcul du coef
    let maxCoef = 0;
    $('.matiere .notes')[index].childNodes.forEach(note => {
        const noteCoef = parseFloat(note.childNodes[1].getAttribute('coef'))
        if (noteCoef > maxCoef) maxCoef = noteCoef
    })
    $('.matiere .notes').filter(posIndex => posIndex == index).first().each((index, item) => {
        item.childNodes.forEach((note) => {
            let coef = parseFloat(note.childNodes[1].getAttribute('coef'));
            note.childNodes[1].style.width = (parseFloat(coef)/maxCoef)*100 + '%';
        })
    });
}

function setIcons() {
    $('.matiere').each((index, matiere) => {
        if (Object.keys(icons).includes(matiere.getAttribute('name'))) {
            // remplace son logo
            $('.matiere .icon i')[index].classList.add(icons[matiere.getAttribute('name')]);
        }
    })
}


// hamburger menu
$('.hamburgler').click(function(e){
    e.preventDefault();
    $(this).toggleClass('no-hamburgler');
});


// custom context menu
let selectedNote;
let selectedMatiere;

document.addEventListener('click', (e) => {

    // remove context menu
    if (e.target.nodeName == "HTML") removeContextMenu();
    else if (!e.target.id !="contextMenu" && e.target.parentNode.id != "contextMenu" && !e.target.parentNode.classList.contains('menuList') && !e.target.classList.contains('menuList') && e.target.parentNode.parentNode.id != "contextMenu") removeContextMenu();

    // mettre la note en non-significative
    //   -> opacité .5
    //   -> attribut state = "visible"/"hidden"
    if (e.target.classList.contains('note') || e.target.classList.contains('coef')) {
        let noteDOM = e.target;
        if (noteDOM.classList.contains('coef')) noteDOM = noteDOM.parentNode;
        let state = noteDOM.getAttribute('state');

        if (state == "visible") {
            noteDOM.setAttribute('state', 'hidden');
            noteDOM.style.opacity = '.5';
        }
        if (state == "hidden") {
            noteDOM.setAttribute('state', 'visible');
            noteDOM.style.opacity = '1';
        }

        // update Means
        const index = getMatiereNames().indexOf(noteDOM.parentNode.parentNode.getAttribute('name'));
        computeMean(index);
        noteExtreme(index);
        computeGlobalMean();
    } else if (e.target.classList.contains('menu')) {
        $('#menu').removeClass('active');
        $('.hamburgler').removeClass('no-hamburgler');
    }
})

document.addEventListener('contextmenu', (e) => {
    let target = e.target;
    if (target.classList.contains('fas') || target.classList.contains('coef')) target = target.parentNode;
    if (target.classList.contains('note')) {
        // note
        e.preventDefault();
        noteClickListener(target, e);
    } else if (target.classList.contains('notes')) {
        // matiere
        e.preventDefault();
        matiereClickListener(target, e);
    }
})

function noteClickListener(target, e) {
    selectedNote = target;
    selectedMatiere = target.parentNode.parentNode;

    // set coef label
    let coef = target.childNodes[1].getAttribute('coef');
    $('#contextMenu .infoMenu h1 span')[0].innerHTML = coef;

    $('#contextMenu').css('top', e.pageY).css('left', e.pageX).addClass('active editNote').removeClass('editMatiere');
}

function matiereClickListener(target, e) {
    selectedMatiere = target.parentNode;

    $('#contextMenu').css('top', e.pageY).css('left', e.pageX).addClass('active editMatiere').removeClass('editNote');
}

$('.editMenu').on('click', () => {
    $('#contextMenu .addNoteContainer').addClass('active edit');
    $('#addNoteValue').focus();
})

$('.deleteMenu').on('click', () => {
    selectedNote.remove();
    removeContextMenu();
    const index = Array.prototype.indexOf.call(selectedMatiere.parentNode.children, selectedMatiere);
    computeCoef(index);
    computeMean(index);
    noteExtreme(index);
    meanExtreme();
    computeGlobalMean();
})

$('.addNoteMenu').on('click', () => {
    $('#contextMenu .addNoteContainer').addClass('active').removeClass('edit');
    $('#addNoteValue').focus();
})

$('#addNoteValidate').on('click', () => {

    let sur;

    if ($('#addNoteValue').val().split('/')[0] == "") {
        alert('Impossible d\'ajouter la note, car les valeurs saisies sont invalides');
        return;
    }

    if (!$('#addNoteValue').val().includes('/') && !isNaN(parseFloat($('#addNoteValue').val().replaceAll(',', '.')))) {
        sur = 20.0;
    } else sur = parseFloat($('#addNoteValue').val().split('/')[1].replaceAll(',', '.').replaceAll('/', ''));

    let value = parseFloat($('#addNoteValue').val().split('/')[0].replaceAll(',', '.'));
    let coef = parseFloat($('#addNoteCoef').val().replace(',', '.'));
    const editMode = $('#contextMenu .addNoteContainer').hasClass('edit');

    removeContextMenu();

    // check if numbers are correct
    if (isNaN(value) || isNaN(sur) || isNaN(coef) || value > sur || value < 0 || !(sur > 0) || !(coef > 0)) {
        alert('Impossible d\'ajouter la note, car les valeurs saisies sont invalides');
        return;
    }

    const index = Array.prototype.indexOf.call(selectedMatiere.parentNode.children, selectedMatiere);

    if (editMode) {
        // edit note
        selectedNote.childNodes[0].innerHTML = value+"<span>/"+sur+"</span>";
        selectedNote.childNodes[1].setAttribute('coef', coef);
    } else {
        // creation de la note
        const noteNode = noteDOM.replace('NOTE', value).replace('SUR', sur).replace('COEF', coef);
        $('.notes')[index].innerHTML += noteNode;
    }

    // mise à jour des coef
    computeCoef(index);

    // mise en forme des extremes (notes) et calcule de la moyenne
    noteExtreme(index);
    computeMean(index);
    meanExtreme();
    computeGlobalMean();
})


function removeContextMenu() {
    $('#contextMenu').removeClass('active editMatiere editNote');
    $('#contextMenu .addNoteContainer').removeClass('active edit');
    $('#addNoteValue').val('');
    $('#addNoteCoef').val('');
}

// encode all datas to share them
function encodeDatas() {

    const matieres = getMatieres();
    let allDatas = [];

    $('.matiere').each((index, item) => {

        let notes = getNotes(index);

        allDatas.push({
            name: matieres[index].name,
            coef: matieres[index].coef,
            notes: notes,
        })

        // {
        //     name: "",
        //     coef: "",
        //     notes: [
        //         { value: '13', sur: '20', coef: '1', state: 'visible/hidden' }
        //         [...]
        //     ]
        // }
    })

    allDatas[0].baseCoef = $('#moyenneG').attr('start');
    let encode = btoa(JSON.stringify(allDatas));
    return encode;
}

// MENU PART

// deploy menu
document.addEventListener('click', (e) => {
    let target = e.target;

    if (target.nodeName == "HTML") return;
    if (target.parentNode.classList.contains('hamburgler')) target = target.parentNode;
    else if (!target.classList.contains('hamburgler')) return;

    if (target.classList.contains('no-hamburgler')) $('#menu').addClass('active');
    else $('#menu').removeClass('active');
})


function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Start file download.
$('#share').on('click', () => {

    // download a file to share
    var text = encodeDatas();
    var filename = "mes_notes.simuplus";
    
    download(filename, text);
    $('#menu').removeClass('active');
    $('.hamburgler').removeClass('no-hamburgler');
});

// import a file to load
$('#import').on('click', () => {
    var element = document.createElement('input');
    element.setAttribute('type', 'file');
    element.setAttribute('accept', '.simuplus');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    element.addEventListener('change', event => {
        const file = event.target.files[0];
        if (!(file.name.indexOf('.simuplus') > 0)) {
            $('#menu').removeClass('active');
            $('.hamburgler').removeClass('no-hamburgler');
            createNotif('Erreur lors de l\'importation');
            return;
        }

        let reader = new FileReader();
		reader.addEventListener('load', function(e) {
	    		let text = e.target.result;
                const datas = JSON.parse(atob(text));
                loadDatas(datas);
                $('#menu').removeClass('active');
                $('.hamburgler').removeClass('no-hamburgler');
                createNotif('Notes chargées avec succès');
		});
		reader.readAsText(file);
    })

    document.body.removeChild(element);
})

function createNotif(txt) {
    $('#notif .content').text(txt);
    $('#notif').addClass('active');
    setTimeout(() => {
        $('#notif').removeClass('active');
    }, 5000); // 5s
}



// interfaceSelector

$('#interfaceSelector ul li').each((index, item) => {
    item.addEventListener('click', () => {
        if (item.classList.contains('selected')) return;
        $('#interfaceSelector ul li').each((_index, _item) => { _item.classList.remove('selected') })
        item.classList.add('selected');
        $('#interfaceSelector span').css('top', 35*index + 'px');

        // switch to selected page
        if (index == 0) {
            // tableau
            $('#graphs').css('display', 'none');
            $('#table').css('display', 'block');
            $('.moyenneGContainer').css('display', 'flex')
        } else if (index == 1) {
            // graphs
            $('#graphs').css('display', 'block');
            $('#table').css('display', 'none');
            $('.moyenneGContainer').css('display', 'none')
        }
    })
})

// $('#graphs').css('display', 'block');
// $('#table').css('display', 'none');
// $('.moyenneGContainer').css('display', 'none')