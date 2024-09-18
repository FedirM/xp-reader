
import { invoke } from '@tauri-apps/api';


function fetchTranslateWithContext(token, language, passage) {
    console.log('TRY INVOKE translate with: ', {
        preferred_language: language,
        passage,
        search_term: token
    });
    return invoke(
        'translate_with_context',
        {
            options: {
                preferred_language: language,
                passage,
                search_term: token
            }
        }
    );
}

function fetchRowTranslation(token, language, context) {
    console.log("Invoke row_translate");
    return invoke(
        'simple_translate',
        {
            language,
            text: token,
            context
        }
    );
}

export function useTranslation() {
    function tryGet(key) {
        try {
            let res = window.localStorage.getItem(key);
            if (res) {
                if (key.includes('multi')) {
                    return res;
                } else {
                    return JSON.parse(res);
                }
            } else {
                return null;
            }
        } catch (err) {
            console.error('[useTranslation] - ', err);
            return null;
        }
    }

    function trySet(key, translation) {
        try {
            if (key.includes('multi')) {
                window.localStorage.setItem(key, translation);
            } else {
                window.localStorage.setItem(key, JSON.stringify(translation));
            }
        } catch (err) {
            console.error('[useTranslation] - ', err);
        }
    }

    function generateStorageKey(token, language, mode) {
        return `${language}.${mode}.${token}`;
    }


    return async function (token, language, context, mode = "multi") {
        let storageKey = generateStorageKey(token, language, mode);
        let tr = tryGet(storageKey);

        if (tr) {
            console.log('Get tr from storage =)')
            return tr;
        }

        if (mode === 'multi') {
            tr = await fetchRowTranslation(token, language, context);
            trySet(storageKey, tr);
        } else {
            tr = await fetchTranslateWithContext(token, language, context);
            trySet(storageKey, tr);
        }

        return tr;
    }

}