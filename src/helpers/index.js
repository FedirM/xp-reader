import Fuse from 'fuse.js';

export function normalizeText(string) {
    return string.trim().normalize('NFKC');
}

export function clearToken(token) {
    const punctuation = new RegExp(/[.\\,:?!#;|/"+]|(\s*-\s*)/, 'gim');
    return normalizeText(token).replaceAll(punctuation, '');
}


export function tokenization(text, phrases) {
    if (!text.length) {
        return [];
    }

    if (!phrases.length) {
        return normalizeText(text).split(/\s+/);
    }
    let words = normalizeText(text).split(/\s+/);
    let fuseMatrix = phrases.map((p, id) => {
        let fuse = normalizeText(p).split(/\s+/).map(s => new Fuse([s]));
        return {
            id,
            fuse
        }
    });

    let result = [];
    let tmpFuseMatrix = [];
    let completeMatch = [];
    let currPhrase = [];
    let currPhrasePosition = 0;
    let wordId = 0;

    for (let rootId = 0; rootId < words.length || rootId < 7; rootId++) {

        tmpFuseMatrix = [...fuseMatrix];
        completeMatch = [];
        currPhrase = [];
        currPhrasePosition = 0;

        for (wordId = rootId; wordId < words.length; wordId++) {
            let currWord = words[wordId];

            if (!tmpFuseMatrix.length) {
                break;
            }

            for (let v = 0; v < tmpFuseMatrix.length; v++) {
                if (tmpFuseMatrix[v].fuse.length > currPhrasePosition) {
                    let match = tmpFuseMatrix[v].fuse[currPhrasePosition].search(currWord);
                    if (!match.length) {
                        tmpFuseMatrix.splice(v, 1);
                        v -= 1;
                    }
                } else {
                    let f = tmpFuseMatrix.splice(v, 1)[0];
                    v -= 1;
                    completeMatch.push({
                        phrase_length: f.fuse.length,
                        phrase: currPhrase.join(' ')
                    });
                }
            }
            currPhrasePosition += 1;
            currPhrase.push(currWord);
        }

        if (!completeMatch.length) {
            result.push(words[rootId]);
        } else {
            let sorted = completeMatch.sort((a, b) => a.phrase_length - b.phrase_length);
            result.push(sorted[0].phrase);
            rootId += sorted[0].phrase_length - 1;
        }
    }

    return result;
}

export function getContext(tokens, selectedRange) {
    const reEndOfSentence = new RegExp(/(?<=[.!?;。！？…])(?:["'”’»\)\]\}])*\s*/, 'gm');

    // search start of sentence of selected substring
    let searchSentenceStart = selectedRange.start;
    if (searchSentenceStart !== 0) {
        for (let i = searchSentenceStart - 1; i >= 0; i--) {
            if (reEndOfSentence.test(tokens[i])) {
                searchSentenceStart = i + 1;
                break;
            }

            if (i === 0) {
                searchSentenceStart = 0;
            }
        }
    }

    // search end of sentence of selected substring
    let searchSentenceEnd = selectedRange.end;
    if (searchSentenceEnd !== tokens.length - 1) {
        for (let i = searchSentenceEnd + 1; i < tokens.length; i++) {
            if (reEndOfSentence.test(tokens[i])) {
                searchSentenceEnd = i;
                break;
            }

            if (i === tokens.length - 1) {
                searchSentenceEnd = tokens.length - 1;
            }
        }
    }


    /**
     * TODO:
     *  - select sentences around
     *  - fit into limits (+2 sentences from each side) - MAX_CONTEXT_SENTENCES (const.js)
     *  - fit into chars/words limits                   - MAX_PROMPT_WORDS (const.js)
     */


    return {
        context: tokens.slice(searchSentenceStart, searchSentenceEnd + 1).join(' '),
        search_term: tokens.slice(selectedRange.start, selectedRange.end + 1).join(' ')
    };
}