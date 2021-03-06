<?php
/**
 * Clip
 *
 * @copyright  (c) Clip Team
 * @link       http://code.zikula.org/clip/
 * @license    GNU/GPL - http://www.gnu.org/copyleft/gpl.html
 * @package    Clip
 * @subpackage Workflows_Operations
 */

/**
 * updateOnlineState operation
 *
 * @param  array  $pub               publication to set online
 * @param  int    $params['online']  (optional) online value for the publication
 * @param  bool   $params['silent']  (optional) hide or display a status/error message, default: false
 * @return array  publication id as index with boolean value: true if success, false otherwise
 */
function Clip_operation_updateOnlineState(&$pub, $params)
{
    $dom = ZLanguage::getModuleDomain('Clip');

    // process the available parameters
    // set the online parameter, or defaults to offline if it's not set
    $pub['core_online'] = isset($params['online']) ? (int)$params['online'] : 0;
    $silent             = isset($params['silent']) ? (bool)$params['silent'] : false;

    $result = false;

    if ($pub->isValid()) {
        $pub->trySave();
        $result = true;

        // TODO let know hooks that the publication was updated
    }

    // output message
    if (!$silent) {
        if ($result) {
            if ($pub['core_online'] == 1) {
                LogUtil::registerStatus(__("Done! Publication status set to 'published'.", $dom));
            } else {
                LogUtil::registerStatus(__("Done! Publication status set to 'unpublished'.", $dom));
            }
        } else {
            LogUtil::registerError(__('Error! Failed to update the publication.', $dom));
        }
    }

    // returns the result
    return $result;
}
