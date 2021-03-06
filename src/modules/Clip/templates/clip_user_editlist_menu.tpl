{php}
// if the request came from the pubeditlist block, we figure out
// the referer and pass it through the url to the form handler
if ($this->_tpl_vars['source'] == 'block') {
$requestURI = $_SERVER['REQUEST_URI'];
$pos = strpos ($requestURI, 'index.php');
if ($pos !== false) {
$zkURI = substr ($requestURI, $pos);
$this->assign ('referer', DataUtil::formatForDisplayHTML($zkURI));
} else {
$this->assign ('referer', 'index.php');
}
}
{/php}
{pageaddvar name="javascript" value="modules/Clip/javascript/listcontrol.js"}
<div id="productcategorylist">
    <ul id="pubeditlist" style="margin-left:14px;">
        {foreach from=$allTypes item=type key=tid}
        {assign_concat name='thisIDLabel' 1='item_' 2=$tid 3='_0'}
        {checkpermission assign="addAuth" component="clip:input:" instance="$tid::" level="ACCESS_ADD"}
        {checkpermission assign="adminAuth" component="clip:input:" instance="$tid::" level="ACCESS_ADMIN"}
        <li id="{$thisIDLabel}">
            <a href="#{$thisIDLabel}">{$type}</a>
            {if ($addAuth)}&nbsp;<a href="{modurl modname='Clip' type='user' func='editlist' tid=$tid}" title="{gt text="Add new publication"}"><img src="images/icons/extrasmall/edit_add.png" width="10" height="10" alt="{gt text="Add new publication"}" /></a>{/if}
            {if ($adminAuth)}&nbsp;<a href="{modurl modname='Clip' type='admin' func='pubtype' tid=$tid}" title="{gt text="Edit this publication type"}"><img src="images/icons/extrasmall/db_status.png" width="10" height="10" alt="{gt text="Edit this publication type"}" /></a>{/if}
            {if ($adminAuth)}&nbsp;<a href="{modurl modname='Clip' type='admin' func='pubfields' tid=$tid}" title="{gt text="Add, edit or modify the fields of this publication type"}"><img src="images/icons/extrasmall/db_comit.png" width="10" height="10" alt="{gt text="Add, edit or modify the fields of this publication type"}" /></a>{/if}
            <ul id="pubeditlist" style="margin-left:28px;">
                {foreach from=$publist.$tid item=pub}
                {assign_concat name='thisIDLabel' 1='item_' 2=$tid 3='_' 4=$pub.core_pid}
                {assign_concat name='thisID' 1=$tid 2='_' 3=$pub.core_pid}
                <li id="{$thisIDLabel}">
                    {if ($source == 'block')}
                    <a href="{modurl modname='Clip' type=$returntype func='editlist' tid=$tid pid=$pub.core_pid _id=$thisID source='block' goto=$referer}">{$pub._title}</a>
                    {else}
                    <a href="{modurl modname='Clip' type=$returntype func='editlist' tid=$tid pid=$pub.core_pid _id=$thisID goto='editlist'}">{$pub._title}</a>
                    {/if}
                    &nbsp;<a href="{modurl modname='Clip' type='user' func='display' tid=$tid pid=$pub.core_pid title=$pub.core_title|formatpermalink}"><img src="images/icons/extrasmall/demo.png" width="10" height="10" alt="{gt text="View this publication"}"></a>
                </li>
                {/foreach}
            </ul>
        </li>
        {foreachelse}
        <li>{gt text='No publication types found.'}</li>
        {/foreach}
    </ul>
</div>

<script type='text/javascript'>
    ListControl.init(document.getElementById("pubeditlist"));
</script>
