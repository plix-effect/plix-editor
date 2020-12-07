import ReactDOM from "react-dom";
import React, {FC, ReactElement, ReactNode, useCallback, useContext, useEffect, useMemo, useRef} from "react";
import {BSModalPart, BSModalPartProps, CurrentModalContext, CurrentModalInfo} from "./BSModalPart";
import "./BSModal.scss"
import Button from "react-bootstrap/cjs/Button";
import Modal from "react-bootstrap/cjs/Modal";
import {modalManager, ModalManagerCloseReason} from "./ModalManager";


export enum MODAL_COLOR {
    DANGER = "danger",
    SUCCESS = "success",
    WARNING = "warning",
    INFO = "info",
    DEFAULT = "default"
}
export enum MODAL_SIZE {
    LARGE = "lg",
    MEDIUM = "md",
    SMALL = "sm",
    EXTRA_LARGE = "xl",
    EXTRA_SMALL = "xs"
}

export interface IReactModalPromiseProps {
    isOpen?: boolean;
    instanceId?: string;
    close?: (result: any) => void;
}

export interface BSModalProps extends IReactModalPromiseProps{
    size?: MODAL_SIZE
    color?: MODAL_COLOR
    allowClose?: boolean
    centered?: boolean
}

export const BSModal: FC<BSModalProps> = ({size = MODAL_SIZE.MEDIUM, isOpen,instanceId, close: onClose, color = MODAL_COLOR.DEFAULT, children, allowClose = true, centered = true}) => {
    const lastIsOpenRef = useRef(false);

    const [title, body, actions] = useMemo(() => {
        const childs =  React.Children.toArray(children);
        if (!childs[0] || !childs[1]) throw new Error("At least 2 elements must be provided as child to BSModal");
        return [childs[0], childs[1], childs[2] || null];
    }, [children])

    const close = useCallback((value? :any) => {
        if (!modalManager.isModalOpened(instanceId)) return;
        onClose(value);
    }, [instanceId, onClose])

    const closeByControls = useCallback((value?: any) => {
        if (!modalManager.isModalOpened(instanceId))  return;
        close(value)
        modalManager.onClosedModalByButton(instanceId);
    }, [instanceId, close]);


    const closeByManager = useCallback((reason: ModalManagerCloseReason) => {
        if (reason === ModalManagerCloseReason.BACK_BUTTON) {
            if (allowClose) {
                close(undefined);
            }
            return allowClose;
        } else {
            close(undefined);
            return true;
        }
    }, [close, allowClose])

    const onClickClose = useCallback(() => {
        if (!allowClose) return;
        closeByControls()
    }, [closeByControls])

    useEffect(() => {
        if (isOpen && !lastIsOpenRef.current) {
            modalManager.onOpenModal({id: instanceId, close: closeByManager})
            lastIsOpenRef.current = true;
        }
    }, [isOpen])


    const contextValue: CurrentModalInfo = useMemo(() => {
        return {
            instanceId: instanceId,
            close: closeByControls
        }
    }, [instanceId, closeByControls]);

    return (
        <CurrentModalContext.Provider value={contextValue}>
            <Modal show={isOpen} centered={centered} onHide={onClickClose} backdrop={allowClose ? true : "static"} className={"bsmodal"}>
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
