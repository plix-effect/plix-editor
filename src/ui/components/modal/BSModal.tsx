import ReactDOM from "react-dom";
import React, {FC, ReactElement, ReactNode, useCallback, useContext, useEffect, useMemo, useRef} from "react";
import {BSModalPart, BSModalPartProps, CurrentModalContext, CurrentModalInfo} from "./BSModalPart";
import "./BSModal.scss"
import Button from "react-bootstrap/cjs/Button";
import Modal from "react-bootstrap/cjs/Modal";
import {modalManager, ModalManagerCloseReason} from "./ModalManager";


export type ModalSize = | "sm" | "lg" | "xl";

export interface IReactModalPromiseProps {
    isOpen: boolean;
    instanceId?: string;
    close: (result: any) => void;
}

export interface BSModalProps extends IReactModalPromiseProps{
    size?: ModalSize
    allowClose?: boolean
    centered?: boolean
}

export const BSModal: FC<BSModalProps> = ({size = undefined, isOpen,instanceId, close, children, allowClose = true, centered = true}) => {
    const lastIsOpenRef = useRef(false);
    const instanceIdRef  = useRef(instanceId || String(Math.random()*1000000))

    const [title, body, actions] = useMemo(() => {
        const childs =  React.Children.toArray(children);
        if (!childs[0] || !childs[1]) throw new Error("At least 2 elements must be provided as child to BSModal");
        return [childs[0], childs[1], childs[2] || null];
    }, [children])

    const doClose = useCallback((value? :any) => {
        if (!modalManager.isModalOpened(instanceIdRef.current)) return;
        close(value);
    }, [instanceIdRef.current, close])

    const closeByControls = useCallback((value?: any) => {
        if (!modalManager.isModalOpened(instanceIdRef.current))  return;
        doClose(value)
        modalManager.onClosedModalByButton(instanceIdRef.current);
    }, [doClose]);


    const closeByManager = useCallback((reason: ModalManagerCloseReason) => {
        if (reason === ModalManagerCloseReason.BACK_BUTTON) {
            if (allowClose) {
                doClose(undefined);
            }
            return allowClose;
        } else {
            doClose(undefined);
            return true;
        }
    }, [doClose, allowClose])

    const onClickClose = useCallback(() => {
        if (!allowClose) return;
        closeByControls()
    }, [closeByControls])

    useEffect(() => {
        if (isOpen && !lastIsOpenRef.current) {
            modalManager.onOpenModal({id: instanceIdRef.current, close: closeByManager})
        }
        lastIsOpenRef.current = isOpen
    }, [isOpen])


    const contextValue: CurrentModalInfo = useMemo(() => {
        return {
            instanceId: instanceIdRef.current,
            close: closeByControls
        }
    }, [closeByControls]);

    return (
        <CurrentModalContext.Provider value={contextValue}>
            <Modal show={isOpen} centered={centered} onHide={onClickClose} backdrop={allowClose ? true : "static"} className={"bsmodal"} size={size}>
                <Modal.Header closeButton={allowClose}>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {body}
                </Modal.Body>
                {
                    actions ?
                        (
                            <Modal.Footer>
                                {actions}
                            </Modal.Footer>
                        )
                        : null
                }
            </Modal>
        </CurrentModalContext.Provider>
    )

};
