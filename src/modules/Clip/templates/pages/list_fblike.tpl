{if !$homepage}{pagesetvar name="title" value="`$pubtype.title` - `$modvars.ZConfig.sitename`"}{/if}

<h2>
    {gt text=$pubtype.title}
    {fblike url=$returnurl layout='horizontal' width=150 addmetatags=1 metatitle=$pubtype.title rel='list_title'}
</h2>

{include file='clip_generic_navbar.tpl' section='list'}

{if $pubtype.description neq ''}
    <p class="clip-pubtype-desc">{gt text=$pubtype.description}</p>
{/if}

{*clip_pagerabc*}

{checkpermission component='Clip::' instance="`$pubtype.tid`::" level=ACCESS_EDIT assign='auth_editor'}

<table class="z-datatable clip-pub-list">
    <tbody>
        {foreach from=$publist item='item'}
        <tr class="{cycle values='z-even,z-odd'}">
            <td>
                <a href="{modurl modname='Clip' type='user' func='display' tid=$pubtype.tid pid=$item.core_pid title=$item.core_title|formatpermalink}">{$item.core_title}</a>
                <span class="z-sub z-floatright">({gt text='%s read' plural='%s reads' count=$item.core_hitcount tag1=$item.core_hitcount})</span>
            </td>
            <td class="z-right z-nowrap">
                {strip}
                <a href="{modurl modname='Clip' type='user' func='display' tid=$pubtype.tid pid=$item.core_pid title=$item.core_title|formatpermalink}">
                    {img modname='core' src='demo.png' set='icons/extrasmall' __title='View' __alt='View'}
                </a>
                {if $auth_editor}
                &nbsp;
                <a href="{modurl modname='Clip' type='user' func='edit' tid=$pubtype.tid pid=$item.core_pid}">
                    {img modname='core' src='edit.png' set='icons/extrasmall' __title='Edit' __alt='Edit'}
                </a>
                {/if}
                {/strip}

                {modurl modname='Clip' func='display' tid=$pubtype.tid pid=$item.core_pid fqurl=true assign='returnurl'}
                {fblike url=$returnurl width=150 layout='horizontal' rel='list_item'}
            </td>
        </tr>
        {foreachelse}
        <tr class="z-datatableempty">
            <td>{gt text='No publications found.'}</td>
        </tr>
        {/foreach}
    </tbody>
</table>

{if $pager.itemsperpage neq $modvars.Clip.maxperpage}
    {pager display='page' posvar='page' rowcount=$pager.numitems limit=$pager.itemsperpage maxpages=7}
    {*pager display='startnum' posvar='startnum' rowcount=$pager.numitems limit=$pager.itemsperpage maxpages=7*}
{/if}
