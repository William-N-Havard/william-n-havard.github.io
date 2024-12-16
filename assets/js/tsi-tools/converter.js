const ALFABETO = {
    CHIMANI: 0,
    ANTIGUO: 1,
    NUEVO: 2
}

function normalise(obj){
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            obj[key] = obj[key].normalize("NFC");
        } else if (typeof obj[key] === 'object') {
            normalise(obj[key]);
        }
    }
    return obj
}

function stripDiacritics(string) {
    return string.normalize("NFKD").replace(/\p{Diacritic}/gu, "")
}

function reverseSrcTgt(){
    let from = document.querySelector('input[name="src_lang"]:checked');
    let to = document.querySelector('input[name="tgt_lang"]:checked');

    if(from == null || to == null){
        return;
    }

    from = from.value;
    to = to.value;
    from_text = document.getElementById('target').value;

    document.querySelector('input[name="src_lang"][value="'+to+'"]').checked = true;
    document.querySelector('input[name="tgt_lang"][value="'+from+'"]').checked = true;
    document.getElementById('source').value = from_text;

    unlockTargets();
    convert();   
}

function unlockTargets(){
    const from = document.querySelector('input[name="src_lang"]:checked').value;
    
    const buttons = document.getElementsByName("tgt_lang");
    buttons.forEach((button) => {
      if(button.value != from && button.id != "label"){
        button.disabled = false;
      }
      else
      {
        button.disabled = true;
        button.checked = false;
        button.selected = false;
      }
    })
}

function convert() {
    let from = document.querySelector('input[name="src_lang"]:checked');
    let to = document.querySelector('input[name="tgt_lang"]:checked');

    if(from == null || to == null){
      return;
    }
    else{
        from = from.value;
        to = to.value;
        
        if(from == to){ return; }
    }

    // Get the text from the input textarea
    const source = document.getElementById('source').value.normalize("NFC");
    let target = '';
    
    // Get source/target alphabets
    const src_alph = ALFABETO[from];
    const tgt_alph = ALFABETO[to];
    
    // Sort mapper by length
    const sortedMapper = normalise(MAPPING).sort((a, b) => b[src_alph][0].length - a[src_alph][0].length);

    // Iterate and replace
    for (let t = 0; t < source.length;)
    {
        let swapped = false;
        INNER: for (let i = 0; i < sortedMapper.length; i++) {
            let src_char = sortedMapper[i][src_alph][0];
            let tgt_char = sortedMapper[i][tgt_alph];

            if(source.slice(t).startsWith(src_char) || source.slice(t).startsWith(src_char.toUpperCase())){
                // There is restriction on the use of the caracter (e.g. only come before some letter or another, etc.)
                if(tgt_char[1].length > 0){
                    const nextChar = source.slice(t+src_char.length, t+src_char.length+1)
                    if(!tgt_char[1].includes(stripDiacritics(nextChar)) && !tgt_char[1].map(function(x) { return x.toUpperCase(); }).includes(stripDiacritics(nextChar)))
                    {
                        // Restriction not met, skip!
                        continue;
                    }
                }               
                
                // Handle uppercase and lowercase (easier to do here than in the mapper)
                target += source.slice(t).startsWith(src_char.toUpperCase()) ? tgt_char[0].toUpperCase() : tgt_char[0].toLowerCase(); 

                // Increment with number of characters to skip
                t += src_char.length;
                swapped = true;
                break INNER;
            }
        }
        // If we couldn't replace anything, just append the first character
        if(!swapped){
            target += source.slice(t, t+1);
            t+=1;
        }
    }
    document.getElementById('target').value = target;
}
