import "./read-page.css";
import {
    Flex,
    View,
    ComboBox,
    Item,
    ActionButton,
    Text,
} from '@adobe/react-spectrum';
import Pencil from "@spectrum-icons/workflow/Book";
import { LANGUAGE_LIST } from "../../state/const";
import { clearToken, LONG_PRESS_DELTA, normalizeText } from '../../helpers';
import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import TextButton from "../../components/text-button";



function ReadPage({
    source_language,
    preferred_language,
    phrasal_verbs,
    source_text,
    preloaded_translations,
    changePreferedLanguage,
    onEditModeClick,
    onNewTranslation
}) {

    const [tokens, setTokens] = useState([]);
    const [translations, setTranslations] = useState(preloaded_translations);


    const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
    const [selectionMode, setSelectionMode] = useState('single');
    const [isPressing, setIsPressing] = useState(false);
    const [isLongPressing, setIsLongPressing] = useState(false);

    useEffect(() => {
        let currTimeout = setTimeout(() => {
            if (isPressing) {
                setIsLongPressing(true);
            }
        }, LONG_PRESS_DELTA);

        return () => {
            clearTimeout(currTimeout);
        }
    }, [isPressing]);


    function onMousePress(index) {
        setSelectionMode('single');
        console.log('Mode - single');
        setIsPressing(true);
        setSelectionRange(curr => { return { start: index, end: index } });
    }

    function onMouseRelease(index) {
        setIsPressing(false);
        setIsLongPressing(false);

        setSelectionRange(curr => Object.assign(curr, { end: index }));

        const start = Math.min(selectionRange.start, selectionRange.end);
        const end = Math.max(selectionRange.start, selectionRange.end) + 1;

        console.log(`Start: ${start} End: ${end} Diff: ${end - start}`);

        const substr = tokens.slice(start, end);
        console.log('Substr: ', substr);

        // selection staff

        setSelectionMode(() => ((end - start) === 1) ? 'single' : 'multi');
        console.log('Mode: ', selectionMode);
    }

    function onLongPressSelection(index) {
        if (isLongPressing) {
            setSelectionRange(cur => {
                return { ...cur, end: index }
            });
            console.log('[Page] update range: ', selectionRange);
        }
    }

    useEffect(() => {
        const hashTable = {};
        let tmpText = source_text;
        phrasal_verbs.forEach((v, id) => {
            const key = `____PHRASE_KEY_#${id}___`;
            const value = normalizeText(v);
            const re = new RegExp(value.replaceAll(' ', '.?\\s+'), 'gim');
            hashTable[key] = v;

            tmpText = tmpText.replaceAll(re, key);
        });

        setTokens(() => {
            console.log("HASH : ", hashTable);
            console.log("TEXT: ", tmpText);

            return tmpText.split(/\s+/).map((token) => {
                console.log('t: ', token);
                if (token in hashTable || clearToken(token) in hashTable) {
                    return hashTable[token] || hashTable[clearToken(token)];
                } else {
                    return token;
                }
            })
        });

    }, []);

    function onChangePreferredLanguage(opt) {
        setTranslations({ multi: [], single: [] });
        changePreferedLanguage(opt);
    }

    return (
        <Flex direction="column" width="100%" height="100%">
            <View width="100%" paddingY="size-115">
                <Flex direction="row" justifyContent="center" alignItems="flex-end" gap="size-300">
                    {/* <ComboBox
                        label="Source text language"
                        inputValue={source_language}
                        necessityIndicator="icon"
                        isRequired
                        isDisabled
                    >
                        {LANGUAGE_LIST.map((lng) => <Item key={lng}>{lng}</Item>)}
                    </ComboBox> */}
                    <ComboBox
                        label="Primary language"
                        selectedKey={preferred_language}
                        onSelectionChange={onChangePreferredLanguage}
                        necessityIndicator="icon"
                        isRequired
                    >
                        {LANGUAGE_LIST.map((lng) => <Item key={lng}>{lng}</Item>)}
                    </ComboBox>
                    <ActionButton onPress={onEditModeClick}>
                        <Pencil />
                        <Text>Edit Text</Text>
                    </ActionButton>
                </Flex>
            </View>
            <View flex padding="size-160">
                {
                    tokens.map((token, token_id) =>
                        <TextButton
                            id={token_id}
                            label={token}
                            translations={translations}
                            isSelecting={isLongPressing}
                            selectionRange={selectionRange}
                            mode={selectionMode}
                            onMousePress={onMousePress}
                            onMouseRelease={onMouseRelease}
                            onLongPressSelection={onLongPressSelection}
                            onTranslationRequest={onTranslationRequest}
                        />
                    )
                }
            </View>
        </Flex>
    )
}

export default ReadPage;