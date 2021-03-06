// Copyright Clip Team 2011 - license GNU/LGPLv3 (or at your option, any later version).

/* Clip load */
Zikula.define('Clip');

Event.observe(window, 'load', function() {
    Zikula.Clip.TreeSortable.trees.grouptypesTree.config.onSave = Zikula.Clip.Resequence;

    Zikula.Clip.Container.register('main');

    Zikula.UI.Tooltips($$('.tree a'));

    $('groupNew').observe('click', function(e) {
        e.findElement('a').insert({after: Zikula.Clip.Indicator()});
        e.preventDefault();
        Zikula.Clip.MenuAction(null, 'addroot');
    });
    $('groupExpand').observe('click', function(e) {
        e.preventDefault();
        Zikula.Clip.TreeSortable.trees.grouptypesTree.expandAll();
    });
    $('groupCollapse').observe('click', function(e) {
        e.preventDefault();
        Zikula.Clip.TreeSortable.trees.grouptypesTree.collapseAll();
    });

    $('groupControls').removeClassName('z-hide');

    Zikula.Clip.AttachMenu();
});

/* Customization of TreeSortable */
Zikula.Clip.TreeSortable = Class.create(Zikula.TreeSortable,/** @lends Zikula.TreeSortable.prototype */
{
    /**
     * Redraws selected node - sets proper class names on node, removes orphaned ul elements
     * @private
     * @param {HTMLElement} node Node to draw
     * @return void
     */
    drawNode: function ($super, node) {
        $super(node);
        var a = node.down('a'), id = Zikula.Clip.TreeSortable.trees.grouptypesTree.getNodeId(node);
        if (id != parseInt(id)) {
            id = id.split('-')[1];
            a.writeAttribute('onClick', 'javascript:this.insert({after: Zikula.Clip.Indicator()}); Zikula.Clip.AjaxRequest({tid:\''+id+'\'}, \'pubtypeinfo\'); return false;');
        } else {
            a.writeAttribute('onClick', 'return false;');
        }
    }
});

Object.extend(Zikula.Clip.TreeSortable,/** @lends Zikula.Clip.TreeSortable.prototype */
{
    /**
     * List of initilized trees.
     * Trees initilized via add method are avaiable as Zikula.Clip.TreeSortable.trees[element.id]
     * @static
     * @name Zikula.Clip.TreeSortable.trees
     */
    trees: {},
    /**
     * Static method allowing to initialize global available Zikula.Clip.TreeSortable instances
     * @see Zikula.Clip.TreeSortable construct for details
     * @static
     * @name Zikula.Clip.TreeSortable.add
     * @function
     * @param {HTMLElement|String} element Element id or reference
     * @param {Object} [config] Config object
     * @retun void
     */
    add: function(element, config) {
        if (!this.trees.hasOwnProperty(element)) {
            this.trees[element] = new Zikula.Clip.TreeSortable(element, config);
            this.trees[element].drawNodes();
        }
    }
});

Zikula.Clip.Container = Class.create({
    initialize: function(options) {
        this.indicatorEffects = {
            fade: false,
            appear: false
        };
        //options
        this.options = Object.extend({
            indicator: false,
            sidecol: null,
            content: null,
            fade: true,
            fadeDuration: 0.75
        }, options || {});

        this.indicator = this.options.indicator ? $(this.options.indicator) : $('clip_cols_indicator');
        this.sidecol   = this.options.sidecol ? $(this.options.sidecol) : $('clip_cols_sidecol');
        this.content   = this.options.content ? $(this.options.content) : $('clip_cols_maincontent');

        this.numberid  = Zikula.Clip.Container.items.length + 1; //only useful for the effect scoping
    },
    updateHeights: function(){
        this.content.removeAttribute('style');
        this.sidecol.removeAttribute('style');
        var max = Math.max(300, this.content.getHeight(), side = this.sidecol.getHeight());
        this.content.setAttribute('style', "min-height: "+max+"px");
        this.sidecol.setAttribute('style', "min-height: "+max+"px");
    },
    updateContent: function(content) {
        if (content) {
            this.content.update(content);
        }
        this.updateHeights();
        this.hideIndicator();
    },
    showIndicator: function(){
        this.showIndicatorTimeout = window.setTimeout(function(){
            if (this.options.fade){
                this.indicatorEffects.appear = new Effect.Appear(this.indicator, {
                    queue: {
                        position: 'front',
                        scope: 'Zikula.Clip.Container.' + this.numberid
                    },
                    from: 0,
                    to: 1,
                    duration: this.options.fadeDuration / 2
                });
            } else {
                this.indicator.show();
            }
        }.bind(this), 250);
    },
    hideIndicator: function(){
        if (this.showIndicatorTimeout) {
            window.clearTimeout(this.showIndicatorTimeout);
        }
        this.indicator.hide();
    }
});

Object.extend(Zikula.Clip.Container,
{
    items: {},
    register: function(element, config) {
        if (!this.items.hasOwnProperty(element)) {
            this.items[element] = new Zikula.Clip.Container(config);
            this.items[element].updateHeights();
        }
    }
});

/* Context Menu */
Zikula.Clip.AttachMenu = function () {
    Zikula.Clip.ContextMenu = new Control.ContextMenu(Zikula.Clip.TreeSortable.trees.grouptypesTree.tree, {
        animation: false,
        beforeOpen: function(event) {
            Zikula.Clip.ContextMenu.lastClick = event;
            if (!event.findElement('a')) {
                throw $break;
            }
            var node = event.findElement('a').up('li');
            var id   = Zikula.Clip.TreeSortable.trees.grouptypesTree.getNodeId(node);
            Zikula.Clip.ContextMenu.isGrouptype = (id != parseInt(id)) ? false : true;
        }
    });
    /* Grouptype links */
    Zikula.Clip.ContextMenu.addItem({
        label: Zikula.__('Edit'),
        condition: function() {
            return Zikula.Clip.ContextMenu.isGrouptype;
        },
        callback: function(node) {
            Zikula.Clip.MenuAction(node, 'edit');
        }
    });
    Zikula.Clip.ContextMenu.addItem({
        label: Zikula.__('Delete'),
        condition: function() {
            return Zikula.Clip.ContextMenu.isGrouptype && !Zikula.Clip.ContextMenu.lastClick.findElement('a').up('li').down('ul');
        },
        callback: function(node){
            Zikula.Clip.DeleteMenuAction(node);
        }
    });
    Zikula.Clip.ContextMenu.addItem({
        label: Zikula.__('Add group (after selected)'),
        condition: function() {
            return Zikula.Clip.ContextMenu.isGrouptype;
        },
        callback: function(node){
            Zikula.Clip.MenuAction(node, 'addafter');
        }
    });
    Zikula.Clip.ContextMenu.addItem({
        label: Zikula.__('Add subgroup (into selected)'),
        condition: function() {
            return Zikula.Clip.ContextMenu.isGrouptype;
        },
        callback: function(node){
            Zikula.Clip.MenuAction(node, 'addchild');
        }
    });
    /* Pubtype links */
    /*
    Zikula.Clip.ContextMenu.addItem({
        label: Zikula.__('Edit'),
        condition: function() {
            return !Zikula.Clip.ContextMenu.isGrouptype;
        },
        callback: function(node) {
            node.insert({after: Zikula.Clip.Indicator()});
            var tid = Zikula.Clip.TreeSortable.trees.grouptypesTree.getNodeId(node.up('li')).split('-')[1];
            Zikula.Clip.AjaxRequest({'tid':tid}, 'pubtype');
        }
    });
    Zikula.Clip.ContextMenu.addItem({
        label: Zikula.__('Fields'),
        condition: function() {
            return !Zikula.Clip.ContextMenu.isGrouptype;
        },
        callback: function(node) {
            node.insert({after: Zikula.Clip.Indicator()});
            var tid = Zikula.Clip.TreeSortable.trees.grouptypesTree.getNodeId(node.up('li')).split('-')[1];
            Zikula.Clip.AjaxRequest({'tid':tid}, 'pubfields');
        }
    });
    Zikula.Clip.ContextMenu.addItem({
        label: Zikula.__('Relations'),
        condition: function() {
            return !Zikula.Clip.ContextMenu.isGrouptype;
        },
        callback: function(node) {
            node.insert({after: Zikula.Clip.Indicator()});
            var tid = Zikula.Clip.TreeSortable.trees.grouptypesTree.getNodeId(node.up('li')).split('-')[1];
            Zikula.Clip.AjaxRequest({'withtid1':tid, 'op':'or', 'withtid2':tid}, 'relations');
        }
    });
    */
    Zikula.Clip.ContextMenu.addItem({
        label: Zikula.__('Code'),
        condition: function() {
            return !Zikula.Clip.ContextMenu.isGrouptype;
        },
        callback: function(node) {
            node.insert({after: Zikula.Clip.Indicator()});
            var tid = Zikula.Clip.TreeSortable.trees.grouptypesTree.getNodeId(node.up('li')).split('-')[1];
            Zikula.Clip.AjaxRequest({'tid':tid, 'code':'list'}, 'showcode');
        }
    });
    Zikula.Clip.ContextMenu.addItem({
        label: Zikula.__('Admin list'),
        condition: function() {
            return !Zikula.Clip.ContextMenu.isGrouptype;
        },
        callback: function(node) {
            node.insert({after: Zikula.Clip.Indicator()});
            var tid = Zikula.Clip.TreeSortable.trees.grouptypesTree.getNodeId(node.up('li')).split('-')[1];
            Zikula.Clip.AjaxRequest({'tid':tid}, 'publist');
        }
    });
    /*
    Zikula.Clip.ContextMenu.addItem({
        label: Zikula.__('New publication'),
        condition: function() {
            return !Zikula.Clip.ContextMenu.isGrouptype;
        },
        callback: function(node) {
            node.insert({after: Zikula.Clip.Indicator()});
            var tid = Zikula.Clip.TreeSortable.trees.grouptypesTree.getNodeId(node.up('li')).split('-')[1];
            Zikula.Clip.AjaxRequest({'tid':tid}, 'edit');
        }
    });
    */
};

Zikula.Clip.MenuAction = function(node, action) {
    if (!['edit', 'delete', 'addafter', 'addchild', 'addroot'].include(action)) {
        return false;
    }

    if (node) {
        node.insert({after: Zikula.Clip.Indicator()});
    }

    var pars = {
            module: 'Clip',
            type: 'ajax',
            func: action+'group',
            mode: 'add',
            gid:  node ? Zikula.Clip.TreeSortable.trees.grouptypesTree.getNodeId(node.up('li')) : null
        };

    switch (action) {
        case 'edit':
            pars.mode = 'edit';
            break;
        case 'addafter':
            pars.func = 'editgroup';
            pars.pos  = 'after';
            pars.parent = Zikula.Clip.TreeSortable.trees.grouptypesTree.getNodeId(node.up('li'));
            break;
        case 'addchild':
            pars.func = 'editgroup';
            pars.pos  = 'bottom';
            pars.parent = Zikula.Clip.TreeSortable.trees.grouptypesTree.getNodeId(node.up('li'));
            break;
        case 'addroot':
            pars.func = 'editgroup';
            pars.pos  = 'root';
            break;
        case 'delete':
            pars.type = 'ajaxexec';
    }

    new Zikula.Ajax.Request(
        'ajax.php', {
            parameters: pars,
            onComplete: Zikula.Clip.MenuActionCallback
        });

    return true;
};

Zikula.Clip.MenuActionCallback = function(req) {
    if (!req.isSuccess()) {
        Zikula.showajaxerror(req.getMessage());
        return false;
    }

    var data = req.getData();

    switch (data.action) {
        case 'delete':
            var node = $(Zikula.Clip.TreeSortable.trees.grouptypesTree.config.nodePrefix + data.gid);
            Droppables.remove(node);
            node.select('li').each(function(subnode) {
                Droppables.remove(subnode);
            });
            Effect.SwitchOff(node,{
                afterFinish: function() {node.remove();}
            });
            Zikula.Clip.TreeSortable.trees.grouptypesTree.drawNodes();
            break;
        case 'edit':
            $(document.body).insert(data.result);
            Zikula.Clip.OpenForm(data, Zikula.Clip.EditNode);
            break;
        case 'add':
            $(document.body).insert(data.result);
            Zikula.Clip.OpenForm(data, Zikula.Clip.AddNode);
            break;
    }
    return true;
};

/* Form Methods */
Zikula.Clip.OpenForm = function(data, callback) {
    if (Zikula.Clip.Form) {
        Zikula.Clip.Form.destroy();
    }

    Zikula.Clip.Form = new Zikula.UI.FormDialog($('clip_ajax_form_container'), callback, {
        title: $('clip_ajax_form_container').title,
        width: 700,
        buttons: [
            {label: Zikula.__('Submit'), type: 'submit', name: 'submit', value: 'submit', 'class': 'z-btgreen', close: false},
            {label: Zikula.__('Cancel'), type: 'submit', name: 'cancel', value: false, 'class': 'z-btred', close: true}
        ]
    });

    return Zikula.Clip.Form.open();
};


Zikula.Clip.CloseForm = function() {
    Zikula.Clip.Form.destroy();
    Zikula.Clip.Form = null;
};

Zikula.Clip.UpdateForm = function(data) {
    $('clip_ajax_form_container').replace(data);
    Zikula.Clip.Form.window.indicator.fade({duration: 0.2});
    $('clip_ajax_form_container').show();
};

/* Mode callbacks */
Zikula.Clip.DeleteMenuAction = function(node) {
    if (Zikula.Clip.ContextMenu.lastClick.findElement('a').up('li').down('ul')) {
        return false;
    }

    var msg = new Element('div', {id:'dialogContent'}).insert(
            new Element('p').update(Zikula.__('Do you really want to delete this group?'))
        ),
        buttons = [
            {name: 'Delete', value: 'Delete', label: Zikula.__('Delete'), 'class': 'z-btgreen'},
            {name: 'Cancel', value: 'Cancel', label: Zikula.__('Cancel'), 'class': 'z-btred'},
        ];

    Zikula.Clip.DeleteDialog = new Zikula.UI.Dialog(
        msg,
        buttons,
        {title: Zikula.__('Confirmation prompt'), width: 500, callback: function(res) {
             switch (res.value) {
                 case 'Delete':
                    Zikula.Clip.MenuAction(node, 'delete');
                    Zikula.Clip.DeleteDialog.destroy();
                    break;
                default:
                    Zikula.Clip.DeleteDialog.destroy();
             }
        }}
    );
    Zikula.Clip.DeleteDialog.open()
    Zikula.Clip.DeleteDialog.container.down('button[name=Cancel]').focus();
};

Zikula.Clip.EditNode = function(res) {
    if (!res || (res.hasOwnProperty('cancel') && res.cancel === false)) {
        Zikula.Clip.CloseForm();
        return false;
    }

    Zikula.Clip.Form.window.indicator.appear({to: 0.7, duration: 0.2});

    var pars = Zikula.Clip.Form.serialize(true);
    pars.mode = 'edit';

    new Zikula.Ajax.Request('ajax.php?module=Clip&type=ajaxexec&func=savegroup', {
        parameters: pars,
        onComplete: function(req) {
            var data = req.getData();
            if (!req.isSuccess()) {
                Zikula.showajaxerror(req.getMessage());
                Zikula.Clip.CloseForm();
            } else {
                var nodeId  = Zikula.Clip.TreeSortable.trees.grouptypesTree.config.nodePrefix + data.gid;
                var nodeOld = $(nodeId).replace(data.node);
                if (nodeOld.down('ul')) {
                    $(nodeId).insert(nodeOld.down('ul'))
                }
                Zikula.Clip.ReinitTreeNode($(nodeId), data);
                Zikula.Clip.CloseForm();
            }
        }
    });

    return true;
};

Zikula.Clip.AddNode = function(res) {
    if (!res || (res.hasOwnProperty('cancel') && res.cancel === false)) {
        Zikula.Clip.CloseForm();
        return false;
    }

    Zikula.Clip.Form.window.indicator.appear({to: 0.7, duration: 0.2});

    var pars = Zikula.Clip.Form.serialize(true);
    pars.mode = 'add';

    new Zikula.Ajax.Request('ajax.php?module=Clip&type=ajaxexec&func=savegroup', {
        parameters: pars,
        onComplete: function(req) {
            var data = req.getData();
            if (!req.isSuccess()) {
                Zikula.showajaxerror(req.getMessage());
                Zikula.Clip.CloseForm();
            } else {
                var relNode   = $(Zikula.Clip.TreeSortable.trees.grouptypesTree.config.nodePrefix + data.parent);

                if (data.pos == 'root') {
                    $('grouptypesTree').insert({'bottom': data.node});
                } else if (data.pos == 'after') {
                    relNode.insert({'after': data.node});
                } else {
                    var newParent = relNode.down('ul');
                    if (!newParent) {
                        newParent = new Element(('ul'), {'class': 'tree'});
                        relNode.insert(newParent);
                    }
                    newParent.insert({'bottom': data.node});
                }

                var node = $(Zikula.Clip.TreeSortable.trees.grouptypesTree.config.nodePrefix + data.gid);
                Zikula.Clip.ReinitTreeNode(node, data);
                Zikula.Clip.CloseForm();
            }
        }
    });

    return true;
};

Zikula.Clip.ReinitTreeNode = function(node, data) {
    Zikula.Clip.TreeSortable.trees.grouptypesTree.initNode(node);
    Zikula.Clip.TreeSortable.trees.grouptypesTree.drawNodes();
    Zikula.UI.Tooltips(node.select('a'));
};

/* Ajax Indicator */
Zikula.Clip.Indicator = function() {
    return $('ajax_indicator') ? $('ajax_indicator') : new Element('img',{id: 'ajax_indicator', src: 'images/ajax/indicator_circle.gif'});
};

/* Reorder method */
Zikula.Clip.Resequence = function(node, params, data) {
    // only allow inserts of grouptypes on root level
    var id = Zikula.Clip.TreeSortable.trees.grouptypesTree.getNodeId(node)
    if (node.up('li') === undefined && id != parseInt(id)) {
        return false;
    }

    node.insert({bottom: Zikula.Clip.Indicator()});

    var request = new Zikula.Ajax.Request(
        "ajax.php?module=Clip&type=ajaxexec&func=treeresequence",
        {
            parameters: {'data': data},
            onComplete: Zikula.Clip.ResequenceCallback
        });

    return request.success();
};

Zikula.Clip.ResequenceCallback = function(req)
{
    if (!req.isSuccess()) {
        Zikula.showajaxerror(req.getMessage());
        return Zikula.TreeSortable.grouptypesTree.revertInsertion();
    }

    return true;
};


/* Ajax view functions */
Zikula.Clip.AjaxRequest = function(pars, func, type, callback)
{
    // TODO remove the indicator if the click comes of the main container (core mod?)
    Zikula.Clip.Container.items.main.showIndicator();

    pars.module = 'Clip';
    pars.type   = type ? type : 'ajax';
    pars.func   = func ? func : 'publist';

    if (!callback) {
        callback = Zikula.Clip.AjaxRequestCallback;
    }

    new Zikula.Ajax.Request(
        'ajax.php',
        {
            method: 'get',
            parameters: pars,
            onComplete: callback
        });
};


Zikula.Clip.AjaxRequestCallback = function(req)
{
    if (!req.isSuccess()) {
        Zikula.showajaxerror(req.getMessage());
        return false;
    }

    Zikula.Clip.Container.items.main.updateContent(req.getData());

    return true;
};
