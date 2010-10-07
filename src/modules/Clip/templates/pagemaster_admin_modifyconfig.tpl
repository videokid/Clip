
{include file='pagemaster_admin_header.tpl'}

<div class="z-admincontainer">
    <div class="z-adminpageicon">{img modname='core' src='configure.gif' set='icons/large' __alt='Settings'}</div>

    <h2>{gt text='Settings'}</h2>

    <div class="z-menu pm-menu">
        <span class="z-menuitem-title"><a href="{modurl modname='PageMaster' type='admin' func='importps'}">{gt text='Import pagesetter publications'}</a></span>
    </div>

    {form cssClass='z-form' enctype='application/x-www-form-urlencoded'}
    <div>
        {formvalidationsummary}
        <fieldset>
            <legend>{gt text='General settings'}</legend>
            <div class="z-formrow">
                {formlabel for='uploadpath' __text='Upload path'}
                {formtextinput maxLength='200' id='uploadpath'}
                {if $updirstatus < 3}
                    {assign var='updir_msgcolor' value='#ff0000'}
                    {if $updirstatus == 0}
                        {assign var='updir_message' __value='The given path doesn\'t exists'}
                    {elseif $updirstatus == 1}
                        {assign var='updir_message' __value='The given path is not a directory'}
                    {elseif $updirstatus == 2}
                        {assign var='updir_message' __value='The given path is not writeable'}
                    {/if}
                {else}
                    {assign var='updir_msgcolor' value='#00d900'}
                    {assign var='updir_message' __value='The given path is writeable'}
                {/if}
                <span class="z-formnote">
                    {gt text='Path where uploaded files will be stored, relative to the site root (%s)' tag1=$siteroot}<br />
                    <span style="color: {$updir_msgcolor};">{$updir_message}</span>
                </span>
            </div>
            <div class="z-formrow">
                {formlabel for='devmode' __text='Development mode'}
                {formcheckbox id='devmode'}
                <span class="z-formnote z-informationmsg">
                    {gt text='Enable the development mode to see detailed notices about PageMaster requirements.'}
                </span>
            </div>
        </fieldset>

        {modcallhooks hookobject='module' hookaction='modifyconfig' hookid='PageMaster' module='PageMaster'}

        <div class="z-buttons z-formbuttons">
            {formbutton id='update' commandName='update' __text='Save' class='z-bt-ok'}
            {formbutton id='cancel' commandName='cancel' __text='Cancel' class='z-bt-cancel'}
        </div>
    </div>
    {/form}
</div>