// Wartet, bis das DOM (Document Object Model) geladen ist
document.addEventListener("DOMContentLoaded", function() {
    // Setzt ein Timeout von 3000 Millisekunden (3 Sekunden)
    setTimeout(function() {
        const splashScreen = document.getElementById("splash-screen");
        const mainContent = document.getElementById("main-content");

        // Fügt die 'hidden'-Klasse hinzu, um den Splash Screen auszublenden
        splashScreen.classList.add("hidden");
        // Entfernt die 'hidden'-Klasse vom Hauptinhalt, um ihn anzuzeigen
        mainContent.classList.remove("hidden");
        // Optional: Entfernt den overflow vom Body, um Scrollen wieder zu erlauben
        document.body.style.overflow = "auto"; 
    }, 3000); // Dauer in Millisekunden
});

console.log("JS läuft!");
// Großes Alien-Bild
let alienImg = document.getElementById("alien-img");

// Alle Alien-Thumbnails einsammeln
const alienThumbs = Array.from(document.querySelectorAll(".alien-thumb"));

// zuletzt angezeigtes Alien merken
let lastAlienIndex = -1;
// Übergangs-Flag um Mehrfachstarts zu verhindern
let isTransitioning = false;

// Hut-Element (jetzt ein DIV, benutzt PNG als Mask)
const hatImg = document.getElementById("hat-img");
// Outline-Overlay (zeigt die schwarzen Konturen)
const hatOutline = document.getElementById("hat-outline");

// ----------------------
// BACKGROUND SELECTOR
// ----------------------
const bgButtons = document.querySelectorAll('.bg-btn');
bgButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const bgPath = btn.dataset.bg;
        if (bgPath) {
            document.body.style.backgroundImage = `url("../${bgPath}")`;
        }
        // Update active state
        bgButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});



// Klick: Alien sofort ändern (mit Animation)
alienThumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
        if (index === lastAlienIndex) return; // Wenn gleiches Alien, nichts machen
        
        // Preload new image
        const newImg = new Image();
        newImg.onload = () => {
            if (isTransitioning) return;
            isTransitioning = true;
            const parent = alienImg.parentElement;

            // Make the original visibly go to the right
            const outgoing = alienImg;
            // remove any previous animation classes, ensure outgoing is on top
            outgoing.classList.remove('slide-in-left', 'slide-out-right');
            // keep outgoing below the hat (hat z-index = 2) but above incoming
            outgoing.style.zIndex = '1';
            // force reflow so the browser picks up the z-index change before animating
            void outgoing.offsetWidth;
            outgoing.classList.add('slide-out-right');

            // Create incoming element (new image) and animate it from left
            const incoming = document.createElement('img');
            incoming.className = 'incoming-alien';
            incoming.src = thumb.src;
            // position similarly to the existing image, but start off-screen to the left
            incoming.style.position = 'absolute';
            incoming.style.left = '50%';
            incoming.style.top = '50%';
            incoming.style.transform = 'translate(calc(-50% - 150%), -50%)';
            incoming.style.maxWidth = '100%';
            incoming.style.maxHeight = '100%';
            // incoming should be behind outgoing and behind the hat
            incoming.style.zIndex = '0';
            incoming.style.opacity = '0';
            parent.appendChild(incoming);

            // Ensure hat positioning updates after the incoming image loads
            incoming.addEventListener('load', () => {
                updateHatPosition();
                // Force reflow then start the animation by adding the class
                void incoming.offsetWidth;
                incoming.classList.add('slide-in-left');
            });

            // After the animation completes, remove the outgoing element and adopt the incoming as the main one
            setTimeout(() => {
                // remove outgoing
                if (outgoing && outgoing.parentElement) outgoing.remove();

                // make incoming the new main image
                incoming.id = 'alien-img';
                incoming.classList.remove('incoming-alien');
                alienImg = incoming; // update reference
                // reattach load listener used elsewhere
                alienImg.addEventListener('load', updateHatPosition);

                // final positioning update
                updateHatPosition();
                // reset z-index and transition flag
                alienImg.style.zIndex = '';
                isTransitioning = false;
            }, 3500);
        };
        newImg.src = thumb.src;
        
        lastAlienIndex = index;
        resetIdleTimer();
    });
});

// ----------------------
// INAKTIVITÄTSBASIERTER AUTO-WECHSEL
// ----------------------

let idleTimer = null;
const idleTime = 30000; // 30 Sekunden ohne Interaktion

function resetIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer);

    idleTimer = setTimeout(() => {
        changeAlienRandomly();
    }, idleTime);
}

// Funktion für den Zufallswechsel
function changeAlienRandomly() {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * alienThumbs.length);
    } while (randomIndex === lastAlienIndex);

    // Preload new image
    const newImg = new Image();
    newImg.onload = () => {
        const parent = alienImg.parentElement;

        if (isTransitioning) return;
        isTransitioning = true;

    // outgoing original goes right
    const outgoing = alienImg;
    outgoing.classList.remove('slide-in-left', 'slide-out-right');
    // keep outgoing below the hat (hat z-index = 2) but above incoming
    outgoing.style.zIndex = '1';
    void outgoing.offsetWidth;
    outgoing.classList.add('slide-out-right');

        // incoming element slides in from left
        const incoming = document.createElement('img');
        incoming.className = 'incoming-alien';
        incoming.src = alienThumbs[randomIndex].src;
        incoming.style.position = 'absolute';
        incoming.style.left = '50%';
        incoming.style.top = '50%';
        incoming.style.transform = 'translate(calc(-50% - 150%), -50%)';
        incoming.style.maxWidth = '100%';
        incoming.style.maxHeight = '100%';
    // incoming should be behind outgoing and behind the hat
    incoming.style.zIndex = '0';
        incoming.style.opacity = '0';
        parent.appendChild(incoming);

        incoming.addEventListener('load', () => {
            updateHatPosition();
            void incoming.offsetWidth;
            incoming.classList.add('slide-in-left');
        });

        setTimeout(() => {
            if (outgoing && outgoing.parentElement) outgoing.remove();
            incoming.id = 'alien-img';
            incoming.classList.remove('incoming-alien');
            alienImg = incoming;
            alienImg.addEventListener('load', updateHatPosition);
            updateHatPosition();
            alienImg.style.zIndex = '';
            isTransitioning = false;
        }, 3500);
    };
    newImg.src = alienThumbs[randomIndex].src;
    
    lastAlienIndex = randomIndex;
    resetIdleTimer();
}
// ----------------------


window.addEventListener('resize', () => {
    updateHatPosition();
    resetIdleTimer();
});

window.addEventListener('load', () => {
    applyHatPresetForCurrentAlien(); // einmalig beim Laden
});

resetIdleTimer();

// ----------------------
// Hut automatisch ans Alien anpassen
// ----------------------
// Presets pro Alien (Dateiname => parameter) — keys match files in /aliens/
const hatPresets = {
    'clara.png': { size:45, top:-15, x:0, rotate:0, hue:0, sat:100, light:60, opacity:100 },
    'henry.png': { size:48, top:-12, x:0, rotate:-5, hue:0, sat:100, light:60, opacity:100 },
    'mama.png':  { size:50, top:-10, x:0, rotate:3, hue:0, sat:100, light:60, opacity:100 },
    'olaf.png':  { size:40, top:-18, x:0, rotate:8, hue:0, sat:100, light:60, opacity:100 },
    'papa.png':  { size:55, top:-8, x:0, rotate:0, hue:0, sat:100, light:60, opacity:100 }
};

function getAlienBasename() {
    // zieht den Dateinamen aus dem src (robust gegen absolute URLs)
    if (!alienImg || !alienImg.src) return null;
    try {
        const parts = alienImg.src.split('/');
        let name = parts[parts.length - 1] || parts[parts.length - 2];
        // entferne Querystrings
        name = name.split('?')[0];
        return name;
    } catch (e) { return null; }
}

function applyHatPresetForCurrentAlien() {
    const name = getAlienBasename();
    const preset = (name && hatPresets[name]) ? hatPresets[name] : null;
    if (!preset) {
        // kein Preset gefunden: verwende Standardwerte (funktioniert weiterhin mit Slidern)
        return fitHatToAlien();
    }

    // Setze Regler (falls vorhanden) auf Preset-Werte
    const map = {
        'hat-size': preset.size,
        'hat-top': preset.top,
        'hat-x': preset.x,
        'hat-light': preset.light,
        'hat-rotate': preset.rotate,
        'hat-hue': preset.hue,
        'hat-sat': preset.sat,
        'hat-opacity': preset.opacity
    };

    Object.keys(map).forEach(id => {
        const el = document.getElementById(id);
        const out = document.getElementById(id + '-val');
        if (!el) return;
        el.value = map[id];
        if (out) out.textContent = el.value;
    });

    // wende an
    fitHatToAlien();
}
// Einmal global registrieren, z.B. direkt nach const alienImg
alienImg.addEventListener('load', updateHatPosition);

function fitHatToAlien() {
    updateHatPosition();
}


function updateHatPosition() {
    const alien = document.getElementById("alien-img");
    const hat = document.getElementById("hat-img");
    const hatOutline = document.getElementById("hat-outline");

    if (!alien || !hat) return;

    const size = Number(document.getElementById('hat-size')?.value || 45);
    const top = Number(document.getElementById('hat-top')?.value || -15);
    const x = Number(document.getElementById('hat-x')?.value || 0);
    const rotate = Number(document.getElementById('hat-rotate')?.value || 0);
    const hue = Number(document.getElementById('hat-hue')?.value || 0);
    const sat = Number(document.getElementById('hat-sat')?.value || 100);
    const light = Number(document.getElementById('hat-light')?.value || 60);
    // glow slider removed — no-op
    const opacity = Number(document.getElementById('hat-opacity')?.value || 0);
    const outlineOpacity = Number(document.getElementById('hat-outline-opacity')?.value || 100);

    const alienRect = alien.getBoundingClientRect();
    const aspect = hat.dataset.aspect ? Number(hat.dataset.aspect) : 0.6;

    // Skalierung: Größe > 100% wirkt wie scale
    const scale = size / 100;
    const hatWidth = alienRect.width;
    const hatHeight = hatWidth * aspect;

    // glow slider removed — nothing to show




    // Farbe / Maske
    hat.style.position = 'absolute';
    hat.style.width = hatWidth + "px";
    hat.style.height = hatHeight + "px";
    hat.style.top = (alienRect.height * (top / 100)) + "px";
    hat.style.left = "50%";
    hat.style.transform = `translateX(-50%) translateX(${alienRect.width * (x / 100)}px) rotate(${rotate}deg) scale(${scale})`;
    hat.style.transformOrigin = "top center";
    hat.style.backgroundColor = `hsl(${hue}, ${sat/2}%, ${light}%)`;
    hat.style.opacity = opacity / 100;

    // Outline synchronisieren
    if (hatOutline) {
        hatOutline.style.position = 'absolute';
        hatOutline.style.left = hat.style.left;
        hatOutline.style.top = hat.style.top;
        hatOutline.style.width = hatWidth + "px";
        hatOutline.style.height = hatHeight + "px";
        hatOutline.style.transform = hat.style.transform; // scale mitübernehmen!
        hatOutline.style.transformOrigin = hat.style.transformOrigin;
        hatOutline.style.opacity = outlineOpacity / 100;
        hatOutline.style.objectFit = "contain";
        hatOutline.style.mixBlendMode = "multiply";
        hatOutline.style.filter = "none";
        hatOutline.style.webkitFilter = "none";
    }
}


// Alle Hut-Thumbnails
const hatThumbs = document.querySelectorAll(".hat-thumb");

// Hilfsfunktion: setzt die Maske / Quelle des Huts
function setHatImage(src) {
    if (!hatImg) return;
    hatImg.dataset.src = src;
    // Lade das Bild kurz, um das Seitenverhältnis zu kennen (damit das DIV Höhe bekommt)
    const img = new Image();
    img.onload = () => {
        const aspect = img.naturalHeight / img.naturalWidth || 1;
        hatImg.dataset.aspect = aspect.toString();
        // webkit + standard: setze Masken
        hatImg.style.webkitMaskImage = `url("${src}")`;
        hatImg.style.maskImage = `url("${src}")`;
        // Falls bereits Position/Größe bekannt, sofort anwenden
        updateHatPosition();
    };
    img.onerror = () => {
        // Fallback: setze Masken trotzdem
        hatImg.style.webkitMaskImage = `url("${src}")`;
        hatImg.style.maskImage = `url("${src}")`;
        updateHatPosition();
    };
    img.src = src;
    // set outline src immediately so user sees something; actual alignment happens in updateHatPosition
    if (hatOutline) hatOutline.src = src;
}

// Hut ändern per Klick (setzt Mask und passt an)
hatThumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
        setHatImage(thumb.src);
        resetIdleTimer();
    });
});

// ----------------------
// Infinite vertical scroll for hat thumbnails (menubox)
// clones items before+after and recenters on scroll to create loop illusion
// ----------------------
(function setupHatInfiniteScroll(){
    const hatScroll = document.querySelector('#menubox .hat-scroll');
    const hatTrack = document.querySelector('#menubox .hat-track');
    let ticking = false;
    const EPS = 1;
    if (!hatScroll || !hatTrack) return;

    // Select the full item containers (each contains a .shelf and a .hat-thumb)
    const originals = Array.from(hatTrack.querySelectorAll('.hat-item'));
    if (originals.length === 0) return;

    // Wait until all images inside those items are loaded so heights are stable
    const imgs = originals.flatMap(item => Array.from(item.querySelectorAll('img')));
    const whenImagesLoaded = Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(r => img.addEventListener('load', r))));

    whenImagesLoaded.then(() => {
        // Measure group height of the original set of thumbs. Using scrollHeight
        // can be fragile with grid wrapping; measure the combined visual height
        // of the originals instead (top of first -> bottom of last).
        let groupHeight = hatTrack.scrollHeight;
        try {
            const firstRect = originals[0].getBoundingClientRect();
            const lastRect = originals[originals.length - 1].getBoundingClientRect();
            const measured = Math.abs(lastRect.bottom - firstRect.top);
            if (measured && measured > 0) groupHeight = measured;
        } catch (e) {
            // fallback to scrollHeight if anything goes wrong
            groupHeight = hatTrack.scrollHeight;
        }

        // Create clones
    const cloneBefore = originals.map(n => n.cloneNode(true));
    const cloneAfter = originals.map(n => n.cloneNode(true));

        // Append clones after and prepend before
        cloneAfter.forEach(node => hatTrack.appendChild(node));
        cloneBefore.reverse().forEach(node => hatTrack.insertBefore(node, hatTrack.firstChild));

        // Set initial scroll to the start of the original group
        hatScroll.scrollTop = groupHeight;


        // Recenter while scrolling to create loop illusion. Add a small epsilon
        // to account for inertia and fractional pixels on different devices.
        const EPS = 1;
        hatScroll.addEventListener('scroll', () => {
            if (ticking) return;
            window.requestAnimationFrame(() => {
                if (hatScroll.scrollTop >= (groupHeight * 2 - EPS)) {
                    hatScroll.scrollTop -= groupHeight;
                } else if (hatScroll.scrollTop <= EPS) {
                    hatScroll.scrollTop += groupHeight;
                }
                ticking = false;

                 resetIdleTimer();
            });
            ticking = true;
        }, { passive: true });

        // Delegate clicks to set hat (works for cloned items too)
        hatTrack.addEventListener('click', (e) => {
            const target = e.target.closest('.hat-thumb');
            if (!target) return;
            setHatImage(target.src);
             resetIdleTimer();
        });
    });
})();

// ----------------------
// Hat controls binding: Regler-Events und Initialisierung
// ----------------------
;(function bindHatControls(){
    const ids = ['hat-size','hat-top','hat-x','hat-rotate','hat-hue','hat-sat','hat-light','hat-opacity', 'hat-outline-opacity'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        const out = document.getElementById(id + '-val');
        if (!el) return;
        // initial output
        if (out) out.textContent = el.value;
        // live update
        el.addEventListener('input', () => {
            if (out) out.textContent = el.value;
            updateHatPosition();
            resetIdleTimer();  /* Reset inactivity timer on slider change */
        });
    });

    // update on window resize (falls sich Alien-Größe ändert)
    window.addEventListener('resize', () => updateHatPosition());

    // initial apply
    // falls schon ein Hut geladen ist -> setze Maske
    if (hatImg && hatImg.dataset && hatImg.dataset.src) {
        setHatImage(hatImg.dataset.src);
    }
    // Preset für aktuell ausgewähltes Alien anwenden
    if (alienImg && alienImg.src) {
    applyHatPresetForCurrentAlien();
}
})();
