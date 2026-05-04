/**
 * Connect scratch blocks with the vm
 * @param {VirtualMachine} vm - The scratch vm
 * @returns {ScratchBlocks} ScratchBlocks connected with the vm
 */
export default function (vm) {
    const ScratchBlocks = require('scratch-blocks');

    // --- ヘルパー関数（部品）を先に定義 ---
    const spriteMenu = function () {
        const sprites = [];
        for (const targetId in vm.runtime.targets) {
            if (!Object.prototype.hasOwnProperty.call(vm.runtime.targets, targetId)) continue;
            if (vm.runtime.targets[targetId].isOriginal) {
                if (!vm.runtime.targets[targetId].isStage) {
                    if (vm.runtime.targets[targetId] === vm.editingTarget) continue;
                    sprites.push([vm.runtime.targets[targetId].sprite.name, vm.runtime.targets[targetId].sprite.name]);
                }
            }
        }
        return sprites;
    };

    const cloneMenu = function () {
        if (vm.editingTarget && vm.editingTarget.isStage) {
            const menu = spriteMenu();
            return menu.length === 0 ? [['', '']] : menu;
        }
        const myself = ScratchBlocks.ScratchMsgs.translate('CONTROL_CREATECLONEOF_MYSELF', 'myself');
        return [[myself, '_myself_']].concat(spriteMenu());
    };

    const soundsMenu = function () {
        let menu = [['', '']];
        if (vm.editingTarget && vm.editingTarget.sprite.sounds.length > 0) {
            menu = vm.editingTarget.sprite.sounds.map(sound => [sound.name, sound.name]);
        }
        menu.push([ScratchBlocks.ScratchMsgs.translate('SOUND_RECORD', 'record...'), 'SOUND_RECORD']);
        return menu;
    };

    const costumesMenu = function () {
        if (vm.editingTarget && vm.editingTarget.getCostumes().length > 0) {
            return vm.editingTarget.getCostumes().map(costume => [costume.name, costume.name]);
        }
        return [['', '']];
    };

    const backdropNamesMenu = function () {
        const stage = vm.runtime.getTargetForStage();
        if (stage && stage.getCostumes().length > 0) {
            return stage.getCostumes().map(costume => [costume.name, costume.name]);
        }
        return [['', '']];
    };

    const backdropsMenu = function () {
        const next = ScratchBlocks.ScratchMsgs.translate('LOOKS_NEXTBACKDROP', 'next backdrop');
        const previous = ScratchBlocks.ScratchMsgs.translate('LOOKS_PREVIOUSBACKDROP', 'previous backdrop');
        const random = ScratchBlocks.ScratchMsgs.translate('LOOKS_RANDOMBACKDROP', 'random backdrop');
        if (vm.runtime.targets[0] && vm.runtime.targets[0].getCostumes().length > 0) {
            return vm.runtime.targets[0].getCostumes().map(costume => [costume.name, costume.name])
                .concat([[next, 'next backdrop'], [previous, 'previous backdrop'], [random, 'random backdrop']]);
        }
        return [['', '']];
    };

    const jsonForMenuBlock = (name, menuOptionsFn, category, start) => ({
        message0: '%1',
        args0: [{
            type: 'field_dropdown',
            name: name,
            options: () => start.concat(menuOptionsFn())
        }],
        inputsInline: true,
        output: 'String',
        outputShape: ScratchBlocks.OUTPUT_SHAPE_ROUND,
        extensions: [`colours_${category}`]
    });

    const jsonForHatBlockMenu = (hatName, name, menuOptionsFn, category, start) => ({
        message0: hatName,
        args0: [{
            type: 'field_dropdown',
            name: name,
            options: () => start.concat(menuOptionsFn())
        }],
        extensions: [`colours_${category}`, 'shape_hat']
    });

    const jsonForSensingMenus = (menuOptionsFn) => ({
        message0: ScratchBlocks.Msg.SENSING_OF,
        args0: [
            { type: 'field_dropdown', name: 'PROPERTY', options: () => menuOptionsFn() },
            { type: 'input_value', name: 'OBJECT' }
        ],
        output: true,
        outputShape: ScratchBlocks.OUTPUT_SHAPE_ROUND,
        extensions: ['colours_sensing']
    });

    // --- 標準ブロックの初期化 ---
    ScratchBlocks.Blocks.sound_sounds_menu.init = function () {
        this.jsonInit(jsonForMenuBlock('SOUND_MENU', soundsMenu, 'sounds', []));
        this.getField('SOUND_MENU').setValidator(v => {
            if (v === 'SOUND_RECORD') { ScratchBlocks.recordSoundCallback(); return null; }
            return v;
        });
    };
    ScratchBlocks.Blocks.looks_costume.init = function () { this.jsonInit(jsonForMenuBlock('COSTUME', costumesMenu, 'looks', [])); };
    ScratchBlocks.Blocks.looks_backdrops.init = function () { this.jsonInit(jsonForMenuBlock('BACKDROP', backdropsMenu, 'looks', [])); };
    ScratchBlocks.Blocks.event_whenbackdropswitchesto.init = function () { this.jsonInit(jsonForHatBlockMenu(ScratchBlocks.Msg.EVENT_WHENBACKDROPSWITCHESTO, 'BACKDROP', backdropNamesMenu, 'event', [])); };
    ScratchBlocks.Blocks.motion_pointtowards_menu.init = function () { this.jsonInit(jsonForMenuBlock('TOWARDS', spriteMenu, 'motion', [[ScratchBlocks.ScratchMsgs.translate('MOTION_POINTTOWARDS_POINTER', 'mouse-pointer'), '_mouse_']])); };
    ScratchBlocks.Blocks.motion_goto_menu.init = function () { this.jsonInit(jsonForMenuBlock('TO', spriteMenu, 'motion', [[ScratchBlocks.ScratchMsgs.translate('MOTION_GOTO_RANDOM', 'random position'), '_random_'], [ScratchBlocks.ScratchMsgs.translate('MOTION_GOTO_POINTER', 'mouse-pointer'), '_mouse_']])); };
    ScratchBlocks.Blocks.motion_glideto_menu.init = function () { this.jsonInit(jsonForMenuBlock('TO', spriteMenu, 'motion', [[ScratchBlocks.ScratchMsgs.translate('MOTION_GLIDETO_RANDOM', 'random position'), '_random_'], [ScratchBlocks.ScratchMsgs.translate('MOTION_GLIDETO_POINTER', 'mouse-pointer'), '_mouse_']])); };
    ScratchBlocks.Blocks.sensing_of_object_menu.init = function () { this.jsonInit(jsonForMenuBlock('OBJECT', spriteMenu, 'sensing', [[ScratchBlocks.ScratchMsgs.translate('SENSING_OF_STAGE', 'Stage'), '_stage_']])); };
    
    // sensing_of と他のプロトタイプ設定は変更なし
    ScratchBlocks.Blocks.sensing_of.init = function () {
        const blockId = this.id;
        const blockType = this.type;
        const menuFn = () => {
            const stageOptions = [[ScratchBlocks.Msg.SENSING_OF_BACKDROPNUMBER, 'backdrop #'], [ScratchBlocks.Msg.SENSING_OF_BACKDROPNAME, 'backdrop name'], [ScratchBlocks.Msg.SENSING_OF_VOLUME, 'volume']];
            const spriteOptions = [[ScratchBlocks.Msg.SENSING_OF_XPOSITION, 'x position'], [ScratchBlocks.Msg.SENSING_OF_YPOSITION, 'y position'], [ScratchBlocks.Msg.SENSING_OF_DIRECTION, 'direction'], [ScratchBlocks.Msg.SENSING_OF_COSTUMENUMBER, 'costume #'], [ScratchBlocks.Msg.SENSING_OF_COSTUMENAME, 'costume name'], [ScratchBlocks.Msg.SENSING_OF_SIZE, 'size'], [ScratchBlocks.Msg.SENSING_OF_VOLUME, 'volume']];
            if (vm.editingTarget) {
                let lookupBlocks = vm.editingTarget.blocks;
                let sensingOfBlock = lookupBlocks.getBlock(blockId) || vm.runtime.flyoutBlocks.getBlock(blockId);
                if (!sensingOfBlock) return [['', '']];
                const stageVariableOptions = vm.runtime.getTargetForStage().getAllVariableNamesInScopeByType('').sort(ScratchBlocks.scratchBlocksUtils.compareStrings).map(v => [v, v]);
                if (sensingOfBlock.inputs.OBJECT.shadow !== sensingOfBlock.inputs.OBJECT.block) return stageOptions.concat(stageVariableOptions);
                const selectedItem = lookupBlocks.getBlock(sensingOfBlock.inputs.OBJECT.shadow).fields.OBJECT.value;
                if (selectedItem === '_stage_') return stageOptions.concat(stageVariableOptions);
                const target = vm.runtime.getSpriteTargetByName(selectedItem);
                const spriteVariableOptions = target ? target.getAllVariableNamesInScopeByType('', true).sort(ScratchBlocks.scratchBlocksUtils.compareStrings).map(v => [v, v]) : [];
                return spriteOptions.concat(spriteVariableOptions);
            }
            return [['', '']];
        };
        this.jsonInit(jsonForSensingMenus(menuFn));
    };

    ScratchBlocks.Blocks.sensing_distancetomenu.init = function () { this.jsonInit(jsonForMenuBlock('DISTANCETOMENU', spriteMenu, 'sensing', [[ScratchBlocks.ScratchMsgs.translate('SENSING_DISTANCETO_POINTER', 'mouse-pointer'), '_mouse_']])); };
    ScratchBlocks.Blocks.sensing_touchingobjectmenu.init = function () { this.jsonInit(jsonForMenuBlock('TOUCHINGOBJECTMENU', spriteMenu, 'sensing', [[ScratchBlocks.ScratchMsgs.translate('SENSING_TOUCHINGOBJECT_POINTER', 'mouse-pointer'), '_mouse_'], [ScratchBlocks.ScratchMsgs.translate('SENSING_TOUCHINGOBJECT_EDGE', 'edge'), '_edge_']])); };
    ScratchBlocks.Blocks.control_create_clone_of_menu.init = function () { this.jsonInit(jsonForMenuBlock('CLONE_OPTION', cloneMenu, 'control', [])); };

    ScratchBlocks.CheckboxBubble.prototype.isChecked = (id) => vm.runtime.monitorBlocks._blocks[id]?.isMonitored || false;
    ScratchBlocks.StatusIndicatorLabel.prototype.getExtensionState = (id) => vm.getPeripheralIsConnected(id) ? ScratchBlocks.StatusButtonState.READY : ScratchBlocks.StatusButtonState.NOT_READY;
    ScratchBlocks.FieldNote.playNote_ = (n, id) => vm.runtime.emit('PLAY_NOTE', n, id);
    ScratchBlocks.utils.is3dSupported = () => true;

    // --- ここに3Dブロックの定義を追加（extensionsを使ってエラーを防止） ---
    ScratchBlocks.Blocks['motion_setz'] = {
        init: function () {
            this.jsonInit({
                "message0": "z座標を %1 にする",
                "args0": [{ "type": "input_value", "name": "Z" }],
                "category": ScratchBlocks.Categories.motion,
                "extensions": ["colours_motion", "shape_statement"]
            });
        }
    };
    ScratchBlocks.Blocks['motion_changezby'] = {
        init: function () {
            this.jsonInit({
                "message0": "z座標を %1 ずつ変える",
                "args0": [{ "type": "input_value", "name": "Z" }],
                "category": ScratchBlocks.Categories.motion,
                "extensions": ["colours_motion", "shape_statement"]
            });
        }
    };
    ScratchBlocks.Blocks['motion_zposition'] = {
        init: function () {
            this.jsonInit({
                "message0": "z座標",
                "category": ScratchBlocks.Categories.motion,
                "checkboxInFlyout": true,
                "extensions": ["colours_motion", "output_number"]
            });
        }
    };

    return ScratchBlocks;
}
