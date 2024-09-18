import './main.css';
import {
    OverlayArrow,
    Popover,
    PopoverContext,
    composeRenderProps,
    useSlottedContext,
    Dialog,
} from 'react-aria-components';
import {
    Content,
    Flex,
    View,
    Text,
    Divider
} from '@adobe/react-spectrum';

import { tv } from 'tailwind-variants';
import { useEffect } from 'react';


const styles = tv({
    base: 'bg-white dark:bg-zinc-900/70 dark:backdrop-blur-2xl dark:backdrop-saturate-200 forced-colors:bg-[Canvas] shadow-2xl rounded-xl bg-clip-padding border border-black/10 dark:border-white/[15%] text-slate-700 dark:text-zinc-300',
    variants: {
        isEntering: {
            true: 'animate-in fade-in placement-bottom:slide-in-from-top-1 placement-top:slide-in-from-bottom-1 placement-left:slide-in-from-right-1 placement-right:slide-in-from-left-1 ease-out duration-200'
        },
        isExiting: {
            true: 'animate-out fade-out placement-bottom:slide-out-to-top-1 placement-top:slide-out-to-bottom-1 placement-left:slide-out-to-right-1 placement-right:slide-out-to-left-1 ease-in duration-150'
        }
    }
});

export function TranslationPopoverComponent({
    isOpen,
    triggerRef,
    openChange,
    showArrow,
    className,
    mode,
    translation,
    ...props
}) {
    let popoverContext = useSlottedContext(PopoverContext);
    let isSubmenu = popoverContext?.trigger === 'SubmenuTrigger';
    let offset = showArrow ? 12 : 8;
    offset = isSubmenu ? offset - 6 : offset;

    useEffect(() => {
        console.log('Popover tr component rerender....');
        console.log('WidtH: ', window.visualViewport.width);
    });

    function getWordTmpl() {
        return (
            <Content margin="size-150">
                <Flex direction="column">
                    <View>
                        <Flex direction="row" justifyContent="space-around" alignItems="center">
                            <View>{translation.translation}</View>
                            <View>{translation.transcription}</View>
                        </Flex>
                    </View>
                    <View>
                        <div className="w-full h-[2px] my-3 dark:bg-neutral-400 light:bg-gray-400"></div>
                        <Text>{translation.meaning_preferred}</Text>
                    </View>
                </Flex>
            </Content>
        )
    }

    function getPhraseTmpl() {
        return (
            <Content>
                <Text>{JSON.stringify(translation)}</Text>
            </Content>
        )
    }

    function getLoaderTmpl() {
        return (
            <Content>
                <div className="w-36 h-18 flex items-center justify-center">
                    <div
                        className="flex flex-grow-0 flex-shrink-0 h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                    >
                        <span
                            className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                        >Loading...</span>
                    </div>
                </div>
            </Content>
        )
    }

    function getContentTmpl() {
        if (translation) {
            if (mode === 'single') {
                return getWordTmpl();
            } else {
                return getPhraseTmpl();
            }
        } else {
            return getLoaderTmpl();
        }
    }

    return (
        <Popover
            offset={offset}
            isOpen={isOpen}
            triggerRef={triggerRef}
            onOpenChange={openChange}
            {...props}
            className={composeRenderProps(className, (className, renderProps) => styles({ ...renderProps, className }))}
        >
            {showArrow &&
                <OverlayArrow className="group">
                    <svg width={12} height={12} viewBox="0 0 12 12" className="block fill-white dark:fill-[#1f1f21] forced-colors:fill-[Canvas] stroke-1 stroke-black/10 dark:stroke-zinc-600 forced-colors:stroke-[ButtonBorder] group-placement-bottom:rotate-180 group-placement-left:-rotate-90 group-placement-right:rotate-90">
                        <path d="M0 0 L6 6 L12 0" />
                    </svg>
                </OverlayArrow>
            }
            <Dialog>
                <div style={{ maxWidth: Math.round(window.visualViewport.width / 2) + 'px' }}>
                    {getContentTmpl()}
                </div>
            </Dialog>

        </Popover >
    );
}