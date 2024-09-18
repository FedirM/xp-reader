import './main.css'
import { getContext, tokenization } from "../../helpers";
import { useTranslation } from "../../hooks/useTranslation";
import { useEffect, useState, useRef } from "react";
import React from 'react';
import { TranslationPopoverComponent } from "../translation-popover";

import { tv } from 'tailwind-variants';
import { LONG_PRESS_DELTA } from "../../state/const";

export function ReaderComponent({ text, phrases, language }) {
    useEffect(() => {
        console.log('Reader component rerender....');
    });
    const [tokens, setTokens] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const popoverTriggerRef = useRef(null);

    // Translation
    const fetchTranslation = useTranslation();
    const [translation, setTranslation] = useState(null);

    // User input (click)
    const [userInput, setUserInput] = useState({
        isPress: false,
        isLongPress: false,
        selectionRange: {
            start: null,
            end: null
        }
    });

    // const [isPress, setPress] = useState(false);
    // const [isLongPress, setLongPress] = useState(false);
    // const [selectionRange, setSelectionRange] = useState({ start: null, end: null });

    // function debug(string) {
    //     console.log('[DEBUG]: ', string);
    //     console.table({
    //         isPress,
    //         isLongPress,
    //         selectionRange: JSON.stringify(selectionRange),
    //     });
    // }

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (userInput.isPress) setUserInput(old => { return { ...old, isLongPress: true } });
        }, LONG_PRESS_DELTA);

        return () => {
            clearTimeout(timeout);
        }
    }, [userInput.isPress]);

    useEffect(() => {
        setTokens(tokenization(text, phrases));
    }, [text, phrases]);

    function onPressStart(event) {
        if (event.button === 2) return; // Disable right click
        const btnID = parseInt(event.target.id);
        setUserInput({
            isPress: true,
            isLongPress: false,
            selectionRange: { start: btnID, end: btnID }
        });
        popoverTriggerRef.current = event.target;
    }

    function onPressEnd(event) {
        if (event.button === 2) return; // Disable right click
        const btnID = parseInt(event.target.id);
        if (userInput.selectionRange.start < btnID) {
            popoverTriggerRef.current = event.target;
        }

        setUserInput((old) => {
            return {
                isPress: false,
                isLongPress: false,
                selectionRange: { ...old.selectionRange, end: btnID }
            }
        });

        setIsOpen(true);
        getTranslation();

    }

    function onMouseOver(event) {
        if (!userInput.isLongPress) return;
        const btnID = parseInt(event.target.id);
        setUserInput((old) => {
            return {
                ...old,
                selectionRange: {
                    ...old.selectionRange,
                    end: btnID
                }
            }
        });
    }

    function onPopoverOpenStateChange(state) {
        if (!state) {
            setIsOpen(false);
            setUserInput((old) => {
                return {
                    ...old,
                    isPress: false,
                    isLongPress: false
                }
            });
            setTranslation(null);
        }
    }

    function getMode() {
        return (Math.abs(userInput.selectionRange.start - userInput.selectionRange.end) > 0) ? 'multi' : 'single';
    }

    function getTranslation() {
        const start = Math.min(userInput.selectionRange.start, userInput.selectionRange.end);
        const end = Math.max(userInput.selectionRange.start, userInput.selectionRange.end);
        const ctx = getContext(tokens, { start, end });

        console.table({
            search_term: ctx.search_term,
            language,
            context: ctx.context,
            mode: getMode()
        });

        fetchTranslation(
            ctx.search_term,
            language,
            ctx.context,
            getMode()
        ).then(res => {
            setTranslation(res);
            console.log('res: ', res);
        }).catch(console.error);


    }

    // TEMPLATE & STYLES

    function isButtonInSelectionRange(id) {
        id = parseInt(id, 10);
        return (userInput.isLongPress
            && (
                (userInput.selectionRange.start <= id && id <= userInput.selectionRange.end)
                || (userInput.selectionRange.start >= id && id >= userInput.selectionRange.end)
            )
        );
    }

    function getPositionInRange(id) {
        if (!isButtonInSelectionRange(id)) return 'outside';
        id = parseInt(id, 10);
        const start = Math.min(userInput.selectionRange.start, userInput.selectionRange.end);
        const end = Math.max(userInput.selectionRange.start, userInput.selectionRange.end);

        if (start === id) {
            return 'first'
        } else if (end === id) {
            return 'last'
        } else {
            return 'inside'
        }
    }

    const styles = tv({
        base: "px-1",
        variants: {
            selectionRange: {
                first: 'rounded-l-lg',
                last: 'rounded-r-lg'
            },
            inRange: {
                true: 'bg-green-900/50',
                false: 'shadow' //'hover:shadow-gray-700/30'
            }
        }
    })

    return (
        <>
            {
                tokens.map((t, id) =>
                    <button
                        id={id}
                        key={`text-btn-${id}`}
                        onMouseDown={onPressStart}
                        onMouseUp={onPressEnd}
                        onMouseOver={onMouseOver}
                        className={styles({
                            inRange: isButtonInSelectionRange(id),
                            selectionRange: getPositionInRange(id)
                        })}
                    >{t}</button>
                )
            }
            <TranslationPopoverComponent
                mode={getMode()}
                showArrow
                triggerRef={popoverTriggerRef}
                isOpen={isOpen}
                openChange={onPopoverOpenStateChange}
                translation={translation}
            />
        </>
    )
}