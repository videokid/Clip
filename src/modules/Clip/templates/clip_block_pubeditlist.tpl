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

<table>
    <tbody>
        <tr>
            <td valign="top" nowrap>
                {include file="clip_user_editlist_menu.tpl"}
            </td>
        </tr>
    </tbody>
</table>
