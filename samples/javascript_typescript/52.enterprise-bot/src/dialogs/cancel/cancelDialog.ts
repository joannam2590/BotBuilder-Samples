// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License

import { CancelResponses } from './cancelResponses'
import { ComponentDialog, DialogContext, WaterfallStepContext, DialogTurnResult, PromptOptions, WaterfallDialog, ConfirmPrompt } from 'botbuilder-dialogs';

export class CancelDialog extends ComponentDialog {
    // Constants
    public static readonly CancelPrompt: string = 'cancelPrompt';

    // Fields
    private static _responder: CancelResponses;

    constructor() {
        super(CancelDialog.name);
        this.initialDialogId = CancelDialog.name;

        let cancel = [
            CancelDialog.AskToCancel.bind(this),
            CancelDialog.FinishCancelDialog.bind(this)
        ];

        this.addDialog(new WaterfallDialog(this.initialDialogId, cancel));
        this.addDialog(new ConfirmPrompt(CancelDialog.CancelPrompt));
    }

    public static async AskToCancel(sc: WaterfallStepContext): Promise<DialogTurnResult> {
        return await sc.prompt(CancelDialog.CancelPrompt, { 
            prompt : await CancelDialog._responder.renderTemplate(sc.context, 'en', CancelResponses._confirmPrompt)
        });
    }

    public static FinishCancelDialog(sc: WaterfallStepContext): Promise<DialogTurnResult> {
        return sc.endDialog(<boolean>sc.result);
    }

    protected async endComponent(outerDC: DialogContext, result: any)
    {
        const doCancel: boolean = result;

        if (doCancel)
        {
            // If user chose to cancel
            await CancelDialog._responder.replyWith(outerDC.context, CancelResponses._cancelConfirmed);

            // Cancel all in outer stack of component i.e. the stack the component belongs to
            return await outerDC.cancelAllDialogs();
        }
        else
        {
            // else if user chose not to cancel
            await CancelDialog._responder.replyWith(outerDC.context, CancelResponses._cancelDenied);

            // End this component. Will trigger reprompt/resume on outer stack
            return await outerDC.endDialog();
        }
    }
}