const drawingBoard = document.querySelector(".drawing-board svg");//zona de desenare 
toolBtns = document.querySelectorAll(".tool");
const sizeRange = document.querySelector("#size");
const btnSaveAS = document.querySelector("#saveAs");
colorSelect = document.querySelectorAll(".colors .option");
colorPicker = document.querySelector("#color-picker");
const saveButton = document.querySelector("#save");
const loadButton = document.querySelector("#load");
let isDrawing = false;
let selectedElement = null;
let modifyStroke = false;
let modifyColor =  false;
let line = null;
let rect = null;
let circle = null;
let x1, y1;
let strokeWidth;
let path = null;
let pathData = "";
const points = [];
let drawingStack = []; //stiva

let isDragging = false;
let eraseMode = false; 
let isPath = false;
selectedColor = "#000";


drawingBoard.addEventListener("mousedown", (e) => {
     isDrawing = true; // Activează desenarea
     x1 = e.clientX - drawingBoard.getBoundingClientRect().left; //pozitia coord. x a mouse-ului in interiorul drawingBoard-ului = poz.mouse x de la (0,0)- distanta dintre left drawingBoard si (0,0); 
     y1 = e.clientY - drawingBoard.getBoundingClientRect().top; //pozitia coord. y a mouse-ului in interiorul drawingBoard-ului = poz.mouse y de la (0,0)- distanta dintre top drawingBoard si (0,0); 

    if (toolBtns[0].classList.contains("active")) { // se verifica daca toolBtns[0] adica Line este activ
        line = document.createElementNS("http://www.w3.org/2000/svg", "line"); //createElementNS este o functie care creeaza elemente de tip SVG : primul parametru este un namespaceURL pt SVG iar al2lea parametru este qualifiedName (numele tipului de element), in acest caz line
        line.setAttribute("x1", x1); //atat coord de inceput cat si de final ale liniei sunt egale => in acest mom linia este doar un punct
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x1);
        line.setAttribute("y2", y1);
        line.setAttribute("stroke", selectedColor); // setare culoare stroke
        line.setAttribute("stroke-width", strokeWidth); //setare grosime stroke
        drawingBoard.appendChild(line); // Adaugă linia la pânza de desen
    }

    if(toolBtns[1].classList.contains("active")){// se verifica daca toolBtns[1] adica Rect este activ
        rect = document.createElementNS("http://www.w3.org/2000/svg", "rect"); //createElementNS este o functie care creeaza elemente de tip SVG : primul parametru este un namespaceURL pt SVG iar al2lea parametru este qualifiedName (numele tipului de element), in acest caz rect
        rect.setAttribute("x", x1);
        rect.setAttribute("y", y1);
        rect.setAttribute("width", 0); // Începutul dreptunghiului cu lățime și înălțime zero
        rect.setAttribute("height", 0);
        rect.setAttribute("stroke", "black");  // setare culoare stroke
        rect.setAttribute("stroke-width", strokeWidth); //setare grosime stroke
        rect.setAttribute("fill", selectedColor); //setare culoare de umplere
        drawingBoard.appendChild(rect); // Adaugă rect la pânza de desen
    } 

    if(toolBtns[2].classList.contains("active")){ // se verifica daca toolBtns[2] adica Circle este activ
        circle= document.createElementNS("http://www.w3.org/2000/svg", "circle"); //createElementNS este o functie care creeaza elemente de tip SVG : primul parametru este un namespaceURL pt SVG iar al2lea parametru este qualifiedName (numele tipului de element), in acest caz circle
        circle.setAttribute("cx", x1); // coord punctului centrului cercului sunt egale cu coord mouse-ului
        circle.setAttribute("cy", y1);
        circle.setAttribute("r", 0); //raza pentru inceput este egala cu 0
        circle.setAttribute("stroke-width", strokeWidth); //setare grosime stroke
        circle.setAttribute("stroke", "black"); // setare culoare stroke
        circle.setAttribute("fill", selectedColor); //setare culoare de umplere
        drawingBoard.appendChild(circle); // Adaugă circle la pânza de desen
    }

    if(toolBtns[3].classList.contains("active")){ // se verifica daca toolBtns[3] adica Path este activ
        if (e.target.classList.contains("draggable")) { //verifică dacă elementul țintă al evenimentului (e.target) are clasa "draggable"
            const index = Array.from(e.target.parentNode.children).indexOf(e.target);
            const movePointHandler = (event) => {
                const x = event.clientX - drawingBoard.getBoundingClientRect().left; //pozitia coord. x a mouse-ului in interiorul drawingBoard-ului = poz.mouse x de la (0,0)- distanta dintre left drawingBoard si (0,0); 
                const y = event.clientY - drawingBoard.getBoundingClientRect().top; //pozitia coord. y a mouse-ului in interiorul drawingBoard-ului = poz.mouse y de la (0,0)- distanta dintre top drawingBoard si (0,0); 
                e.target.setAttribute("cx", x);
                e.target.setAttribute("cy", y);
                movePoint(index, x, y); //apelare functie cu noile coordonate
            };
            
            const removeHandlers = () => {
                window.removeEventListener("mousemove", movePointHandler);
                window.removeEventListener("mouseup", removeHandlers);
            };
            
            window.addEventListener("mousemove", movePointHandler);
            window.addEventListener("mouseup", removeHandlers);
        }
    }

    if(toolBtns[4].classList.contains("active")){ // Verifică dacă instrumentul "Move" este activ
            isDragging = true;
            selectedElement = e.target; // Salvează elementul selectat. "target" este o proprietate a obiectului eveniment (Event). 
                                        //Această proprietate indică elementul HTML care a declanșat evenimentul. 
                                        //Target furnizează referința la elementul DOM (Document Object Model) pe care s-a produs acțiunea care a generat evenimentul.
        if (e.target.tagName === "line" ) {
            //se extrag coordonatele x și y ale punctului de început al liniei (elementului "line") folosind metoda getAttribute și apoi convertindu-le la valori numerice cu ajutorul funcției parseFloat
            const x1 = parseFloat(selectedElement.getAttribute("x1"));
            const y1 = parseFloat(selectedElement.getAttribute("y1"));
            // diferenta dintre coord mouse-ului si coord formei
            offsetX = e.clientX - x1; 
            offsetY = e.clientY - y1;
        }
    
        if (e.target.tagName === "rect") {
            //se extrag coordonatele x și y ale punctului de început al dreptunghiului (elementului "rect") folosind metoda getAttribute și apoi convertindu-le la valori numerice cu ajutorul funcției parseFloat
            const a = parseFloat(selectedElement.getAttribute("x"));
            const b = parseFloat(selectedElement.getAttribute("y"));
            // diferenta dintre coord mouse-ului si coord formei
            offsetX = e.clientX - a;
            offsetY = e.clientY - b;
        }
    }
});


drawingBoard.addEventListener("mousemove", (e) => {
    if (isDrawing) { //DESENARE
        if(toolBtns[0].classList.contains("active")){ // se verifica daca toolBtns[0] adica Line este activ
            // Actualizare coordonate finale ale liniei în timp ce utilizatorul desenează
            const x2 = e.clientX - drawingBoard.getBoundingClientRect().left; //pozitia coord. x a mouse-ului in interiorul drawingBoard-ului = poz.mouse x de la (0,0)- distanta dintre left drawingBoard si (0,0); 
            const y2 = e.clientY - drawingBoard.getBoundingClientRect().top; //pozitia coord. y a mouse-ului in interiorul drawingBoard-ului = poz.mouse y de la (0,0)- distanta dintre top drawingBoard si (0,0); 
            //setare coord finale
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
        }
        if(toolBtns[1].classList.contains("active")){  // se verifica daca toolBtns[1] adica Rect este activ
            // Actualizare coordonate finale ale dreptunghiului în timp ce utilizatorul desenează
            const x2 = e.clientX - drawingBoard.getBoundingClientRect().left; //pozitia coord. x a mouse-ului in interiorul drawingBoard-ului = poz.mouse x de la (0,0)- distanta dintre left drawingBoard si (0,0); 
            const y2 = e.clientY - drawingBoard.getBoundingClientRect().top; //pozitia coord. y a mouse-ului in interiorul drawingBoard-ului = poz.mouse y de la (0,0)- distanta dintre top drawingBoard si (0,0);
            const width = x2 - x1; // latimea = distanta dintre punct final si punct (0,0) al drawinBoard - distanta dintre punct inital si punct (0,0) al drawinBoard pe coord x
            const height = y2 - y1; // inaltimea = distanta dintre punct final si punct (0,0) al drawinBoard - distanta dintre punct inital si punct (0,0) al drawinBoard pe coord y
            //setare coord finale
            rect.setAttribute("x", x1);
            rect.setAttribute("y", y1);
            rect.setAttribute("width", width);
            rect.setAttribute("height", height);

        }
        if(toolBtns[2].classList.contains("active")){ // se verifica daca toolBtns[2] adica Circle este activ
            // Actualizare coordonate finale ale cercului în timp ce utilizatorul desenează
            const x2 = e.clientX - drawingBoard.getBoundingClientRect().left;
            const y2 = e.clientY - drawingBoard.getBoundingClientRect().top;
            const radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            //setare coord finale
            circle.setAttribute("r", radius);
        }
    }

    if (isDragging) { //MOVE
        // Actualizare poziție linie atunci când utilizatorul muta linia
        if(selectedElement && e.target.tagName === "line"){
            //Proprietatea tagName este o proprietate a obiectelor din DOM (Document Object Model) și furnizează numele tag-ului (etichetei) al elementului HTML.
            //Actualizare poziție linie atunci când utilizatorul muta linia
            const x1 = e.clientX - offsetX; //pozitia curenta mouse pe axa x - distanta dintre pozitia mouselui si marginea din stanga a elementului selectat
            const y1 = e.clientY - offsetY; //pozitia curenta mouse pe axa y - distanta dintre pozitia mouselui si marginea de sus a elementului selectat
            const x2 = x1 + parseFloat(selectedElement.getAttribute("x2")) - parseFloat(selectedElement.getAttribute("x1"));
            const y2 = y1 + parseFloat(selectedElement.getAttribute("y2")) - parseFloat(selectedElement.getAttribute("y1"));
            selectedElement.setAttribute("x1", x1);
            selectedElement.setAttribute("y1", y1);
            selectedElement.setAttribute("x2", x2);
            selectedElement.setAttribute("y2", y2);

        }

        // Actualizare poziție dreptunghi atunci când utilizatorul muta dreptunghiul
        if(selectedElement &&  e.target.tagName === "rect"){
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            selectedElement.setAttribute("x", x);
            selectedElement.setAttribute("y", y);
        }

        // Actualizare poziție cerc atunci când utilizatorul muta cercul
        if(selectedElement && e.target.tagName === "circle"){
            const cx=e.clientX - drawingBoard.getBoundingClientRect().left; //cx = pozitia curenta mouse pe axa x - coordonata orizontală a marginei stângi a pânzei de desen în cadrul întregii pagini
            const cy=e.clientY - drawingBoard.getBoundingClientRect().top; //cy = pozitia curenta mouse pe axa y - coordonata orizontală a marginei sus a pânzei de desen în cadrul întregii pagini
            selectedElement.setAttribute("cx", cx);
            selectedElement.setAttribute("cy", cy);
        }
        
    }
});

drawingBoard.addEventListener("mouseup", () => {
    if(toolBtns[0].classList.contains("active")){
        isDrawing = false;
        line = null;
    }
    if(toolBtns[1].classList.contains("active")){
        isDrawing = false;
        rect = null;
    }
    if (toolBtns[2].classList.contains("active")) {
        isDrawing = false;
        circle = null;
    }
    if(toolBtns[3].classList.contains("active")){
        path =null;
    }
    if (toolBtns[4].classList.contains("active")) {
        isDragging = false;
        selectedElement = null;
    } 
});

// functie activare tool din lista de tools, atunci cand se da click
toolBtns.forEach((btn) => {
    
    btn.addEventListener("click", () => {
        toolBtns.forEach((btn) => {
            btn.classList.remove("active");

        });
        btn.classList.add("active");
        eraseMode = false;
        modifyColor = false;
        modifyStroke= false;
        isPath=false;

    });
});

//ERASE
function erase() {
    eraseMode = true;
}

//eveniment de click pentru elem "Erase"
document.querySelector("#eraser").addEventListener("click", erase);

//PATH
function ispath(){
    isPath = true;
}

//eveniment de click pentru elem "Path"
document.querySelector("#path").addEventListener("click" ,ispath);

//eveniment de click pentru elementele SVG de pe drawingBoard 
drawingBoard.addEventListener("click", (e) => {

    const x = e.clientX - drawingBoard.getBoundingClientRect().left;
    const y = e.clientY - drawingBoard.getBoundingClientRect().top;

    if (eraseMode) {
        if (e.target && (e.target.tagName === "line"|| e.target.tagName === "rect"|| e.target.tagName === "circle" || e.target.tagName==="path")) {
            e.target.remove();
            document.querySelectorAll(".draggable").forEach(point => {
                point.remove();
            });
             points.length = 0;
        }
    }

    if (modifyStroke && (e.target.tagName === "line" || e.target.tagName === "rect" || e.target.tagName === "circle"|| e.target.tagName === "path")) {
        // Dacă suntem în modul de modificare și elementul este unul dintre tipurile dorite, atunci actualizează grosimea liniei și culoarea
        const lineWidth = document.querySelector("#size").value;
        const lineColor = document.querySelector("#color-picker").value;

        e.target.setAttribute("stroke-width", lineWidth);
        e.target.setAttribute("stroke", lineColor);
    }

    if (modifyColor && (e.target.tagName === "line" || e.target.tagName === "rect" || e.target.tagName === "circle" || e.target.tagName === "path")) {
        // Dacă suntem în modul de modificare și elementul este unul dintre tipurile dorite, atunci actualizează culoarea
        const lineColor = document.querySelector("#color-picker").value;

        e.target.setAttribute("fill", lineColor);
    }

    if(isPath){
        //Adăugare punct la lista de puncte
        points.push({ x, y });

        // Creare cerc pentru punctul nou adăugat
        const pointCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        pointCircle.setAttribute("cx", x);
        pointCircle.setAttribute("cy", y);
        pointCircle.setAttribute("r", 4); 
        pointCircle.setAttribute("fill", "red"); 
        pointCircle.setAttribute("class", "draggable"); //clasa pentru a face punctul tratabil la mutare
        drawingBoard.appendChild(pointCircle);

        // Actualizare traseu cu punctele existente
        pathData = points.map(point => `L ${point.x} ${point.y}`).join(" ");

        if (!path) {
            // Creare element path dacă nu există
            path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("stroke-width", strokeWidth);
            path.setAttribute("stroke", "rgba(0, 0, 0, 0)");
            path.setAttribute("fill", selectedColor); 
            drawingBoard.appendChild(path);
        }

        // Setare atribut "d" cu traseul actualizat
        path.setAttribute("d", `M ${points[0].x} ${points[0].y} ${pathData}`);
    }
    
    //save la fiecare click pe panza
    saveDrawingState();
    
});

//SIZE
sizeRange.addEventListener("input", ()=>{
    strokeWidth = sizeRange.value;
});

//PICK COLOR
colorSelect.forEach(btn => {
    btn.addEventListener("click", () => { 
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

//schimbare culoare fundal colorPicker
colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
});

//SAVE AS JPG
document.querySelector("#saveAs").addEventListener("click", () => {
    // Convertirea conținutului SVG într-un șir de caractere SVG valid
    const svgXML = new XMLSerializer().serializeToString(drawingBoard);

    // Adăugarea unui fundal alb la conținutul SVG
    const svgWithWhiteBackground = `<svg xmlns="http://www.w3.org/2000/svg" 
        width="${drawingBoard.width.baseVal.value}" 
        height="${drawingBoard.height.baseVal.value}" 
        style="background-color:white">${svgXML}
    </svg>`;

    // Crearea unui element de tip canvas pentru a desena conținutul SVG
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Setarea dimensiunilor canvasului
    canvas.width = drawingBoard.clientWidth;
    canvas.height = drawingBoard.clientHeight;

    // Crearea unui obiect de tip imagine
    const img = new Image();

    // Definirea funcției care se va executa atunci când imaginea este încărcată
    img.onload = () => {
        // Desenarea conținutului SVG pe canvas
        context.drawImage(img, 0, 0);

        // Generarea unei reprezentări binare (blob) a conținutului canvasului
        canvas.toBlob((blob) => {
            // Crearea unui element de ancoră în DOM
            const a = document.createElement("a"); // Creează un element "a" (ancoră) pentru a facilita descărcarea
            a.href = URL.createObjectURL(blob);
            a.download = "img_editorSVG.jpeg"; // Numele fișierului de descărcat
            a.click(); // Simulează un clic pe elementul "a" pentru a declanșa descărcarea
        });
    };

    // Setarea sursei imaginii la un URL de date (data URL) care conține imaginea SVG, codificată în base64
    img.src = "data:image/svg+xml;base64," + btoa(svgWithWhiteBackground);
});


//SAVE AS SVG
document.querySelector("#saveAsSVG").addEventListener("click", () => {
    const svgXML = new XMLSerializer().serializeToString(drawingBoard); // Serializează conținutul elementului "drawingBoard" într-un șir XML
    const a = document.createElement("a"); // Creează un element "a" (ancoră) pentru a facilita descărcarea
    a.href = "data:image/svg+xml;base64," + btoa(svgXML); // Setează atributul "href" pentru a conține datele SVG în format base64
    a.download = "SVG_editorSVG.svg";  // Setează numele fișierului pentru descărcare
    a.click(); // Simulează un clic pe elementul "a" pentru a declanșa descărcarea
});

//CLEAR ALL
document.querySelector("#clearAll").addEventListener("click", () =>{
    const drawingBoard = document.querySelector(".drawing-board svg");
    while (drawingBoard.firstChild) { //verifică dacă există copii în interiorul elementului SVG.
        drawingBoard.removeChild(drawingBoard.firstChild);
    }
});


//SAVE + LOAD
document.addEventListener("DOMContentLoaded", () => { //adaugă un ascultător de evenimente pentru evenimentul "DOMContentLoaded". Acest eveniment este declanșat atunci când întregul document HTML a fost încărcat, inclusiv toate resursele asociate (imagini, stiluri etc.).
    const STORAGE_KEY = "savedDrawing"; //cheie unică pentru a stoca și recupera date din localStorage. În acest caz, cheia este "savedDrawing"

    // Funcție pentru a salva desenul curent în localStorage
    const saveDrawing = () => {
        const svgContent = drawingBoard.outerHTML; //extrage întregul conținut HTML al elementului cu id-ul "drawingBoard" și îl stochează într-o variabilă numită svgContent
        localStorage.setItem(STORAGE_KEY, svgContent);// utilizează localStorage pentru a salva conținutul desenului sub cheia "savedDrawing"
    };

    // Funcție pentru a încărca desenul salvat din localStorage
    const loadDrawing = () => {
        const savedDrawing = localStorage.getItem(STORAGE_KEY); //preia din localStorage
        if (savedDrawing) {
            drawingBoard.innerHTML = savedDrawing; // setează conținutul HTML al elementului cu id-ul "drawingBoard" cu desenul salvat.
        }
    };

    // Ascultător de eveniment pentru clic pe butonul de salvare
    saveButton.addEventListener("click", saveDrawing);

    // Ascultător de eveniment pentru clic pe butonul de încărcare
    loadButton.addEventListener("click", loadDrawing);

    // Încărcăm desenul salvat la pornirea paginii
    loadDrawing();
});

//MODIFICA STROKE SI CULOARE
document.querySelector("#modifyStroke").addEventListener("click", () => {
    modifyStroke = !modifyStroke; // Invertește starea modului de modificare la fiecare clic
    if (modifyStroke) {
        // Dacă suntem în modul de modificare, adaugă clasa "active" la butonul "Modify"
        document.querySelector("#modifyStroke").classList.add("active");
    } else {
        // Dacă nu suntem în modul de modificare, elimină clasa "active"
        document.querySelector("#modifyStroke").classList.remove("active");
    }
});

document.querySelector("#modifyColor").addEventListener("click", () => {
    modifyColor = !modifyColor; // Invertește starea modului de modificare la fiecare clic
    if (modifyColor) {
        // Dacă suntem în modul de modificare, adaugă clasa "active" la butonul "Modify"
        document.querySelector("#modifyColor").classList.add("active");
    } else {
        // Dacă nu suntem în modul de modificare, elimină clasa "active"
        document.querySelector("#modifyColor").classList.remove("active");
    }
});

//Funcție pentru actualizarea poziției unui punct în array-ul points. se reflectă aceste modificări în atributul "d" al unui element SVG path
function movePoint(index, newX, newY) { //index reprezintă indexul punctului care trebuie mutat, iar newX și newY reprezintă noile coordonate ale punctului
    if (index >= 0 && index < points.length) {
        points[index].x = newX; //actualizate cu noile valori primite ca argumente
        points[index].y = newY;

        // Actualizare traseu cu punctele actualizate, excludând punctul curent
        //1.points.map parcurge fiecare element din array-ul points
        //2.pentru fiecare element (punct), este apelată o funcție anonimă specificată în argumentul map. Această funcție primește un punct ca argument și întoarce o comandă SVG formată din coordonatele x și y ale punctului, împreună cu litera "L" care indică o linie în cadrul unui traseu SVG.
        //3.rezultatele transformărilor sunt stocate într-un nou array, în cazul de față, o listă de comenzi SVG.
        //4.metoda join(" ") este apoi folosită pentru a concatena toate comenzi SVG într-un singur șir, separându-le prin spațiu.
        pathData = points.map(point => `L ${point.x} ${point.y}`).join(" ");
        path.setAttribute("d", `M ${points[0].x} ${points[0].y} ${pathData}`); //Se actualizează atributul "d" al elementului SVG path cu noul șir de comenzi, începând cu comanda de deplasare (M) la primul punct (points[0]).
    }
}

//UNDO
function saveDrawingState() {
    const drawingState = { //obiect de tip drawingState
        points: JSON.parse(JSON.stringify(points)), // copie a listei de puncte (points) pentru a salva starea actuală a punctelor.
        pathData: pathData, // starea actuală a datelor path-ului
        elements: Array.from(drawingBoard.children), // copie a tuturor elementelor prezente în drawingBoard la momentul apelării funcției
    };
    drawingStack.push(drawingState); // adăugare obiectul drawingState la stiva drawingStack
}

function restoreDrawingState(state) { //functia goloseste panza de desen inital apoi restaureaza toate elementele  la un anumit moment din stiva
    drawingBoard.innerHTML = ""; // Golește complet drawingBoard, eliminând toate elementele existente înainte de a restaura starea
    points.length = 0; // Golește lista points
    state.points.forEach(point => {
        points.push({ x: point.x, y: point.y }); // Restaurează punctele (points) din obiectul state
    });

    pathData = state.pathData; // Restaurează datele path-ului (pathData) din obiectul state.

    state.elements.forEach(element => {
        drawingBoard.appendChild(element.cloneNode(true)); // Restaureaza fiecare element
    });

    if (path) {
        path.setAttribute("d", `M ${points[0].x} ${points[0].y} ${pathData}`); // Dacă există un element path, îi actualizează atributul "d" cu datele path-ului restaurate
    }
}

// Restaurare starea anterioară la apăsarea tastei "Z"
document.addEventListener("keydown", (e) => {
    if (e.key === "z") {
        if (drawingStack.length > 1) {
            drawingStack.pop(); // Elimină starea curentă
            const previousState = drawingStack[drawingStack.length - 1];
            restoreDrawingState(previousState);
        }
    }
});

// Adaugă un eveniment de dublu click pe drawingBoard
drawingBoard.addEventListener("dblclick", () => {
    if (path) {
        //comanda "Z" indică închiderea formei definite de traseu
        pathData += " Z";
        // Setează atributul "d" pentru traseul actualizat
        path.setAttribute("d", `M ${points[0].x} ${points[0].y} ${pathData}`);
        // Resetează punctele pentru a începe un nou traseu
        points.length = 0;
        // Resetează pathData pentru traseu nou
        pathData = "";
    }
});
