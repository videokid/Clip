<?php
/**
 * Clip
 *
 * @copyright  (c) Clip Team
 * @link       http://code.zikula.org/clip/
 * @license    GNU/GPL - http://www.gnu.org/copyleft/gpl.html
 * @package    Clip
 * @subpackage Api
 */

/**
 * Search Model.
 */
class Clip_Api_Search extends Zikula_AbstractApi
{
    /**
     * Search plugin info.
     */
    public function info()
    {
        return array('title'     => 'Clip',
                     'functions' => array('Clip' => 'search'));
    }

    /**
     * Search form component.
     */
    public function options($args)
    {
        if (SecurityUtil::checkPermission('Clip::', '::', ACCESS_READ)) {
            $render = Zikula_View::getInstance('Clip');

            $render->assign('pubtypes', self::get_searchable());

            return $render->fetch('clip_search_options.tpl');
        }

        return '';
    }

    /**
     * Search plugin main function.
     */
    public function search($args)
    {
        ModUtil::dbInfoLoad('Search');

        $search_tid = isset($args['tids']) ? (array)$args['tids'] : (array)FormUtil::getPassedValue('search_tid', array(), 'REQUEST');
        $sessionId  = session_id();

        $pubtypes = self::get_searchable();

        foreach ($pubtypes as $pubtype)
        {
            if ($search_tid == '' || isset($search_tid[$pubtype['tid']])) {
                $where_arr = Doctrine_Core::getTable('Clip_Model_Pubfield')
                             ->selectFieldArray('name', "issearchable = '1' AND tid = '$pubtype[tid]'");

                $where  = Search_Api_User::construct_where($args, $where_arr, 'core_language');
                $where .= " AND core_showinlist = '1'
                            AND core_online = '1'
                            AND core_indepot = '0'
                            AND (core_publishdate <= NOW() OR core_publishdate IS NULL)
                            AND (core_expiredate >= NOW() OR core_expiredate IS NULL)";

                $publist = Doctrine_Core::getTable('Clip_Model_Pubdata'.$pubtype['tid'])
                           ->selectCollection($where)
                           ->toArray();

                $core_title = Clip_Util::getTitleField($pubtype['tid']);

                foreach ($publist as $pub)
                {
                    $record = array(
                        'title'   => $pub[$core_title],
                        'text'    => '',
                        'extra'   => serialize(array('tid' => $pubtype['tid'], 'pid' => $pub['core_pid'])),
                        'created' => $pub['cr_date'],
                        'module'  => 'Clip',
                        'session' => $sessionId
                    );

                    if (!DBUtil::insertObject($record, 'search_result')) {
                        return LogUtil::registerError($this->__('Error! Could not save the search results.'));
                    }
                }
            }
        }

        return true;
    }

    /**
     * Do last minute access checking and assign URL to items.
     *
     * Access checking is ignored since access check has
     * already been done. But we do add a URL to the found item.
     */
    public function search_check($args)
    {
        $datarow = &$args['datarow'];
        $extra   = unserialize($datarow['extra']);
        $datarow['url'] = ModUtil::url('Clip', 'user', 'display',
                                       array('tid'   => $extra['tid'],
                                             'pid'   => $extra['pid'],
                                             'title' => DataUtil::formatPermalink($datarow['title'])));
        return true;
    }

    /**
     * Method to fetch the searchable pubtypes.
     *
     * @return array Searchable pubtypes.
     */
    public static function get_searchable()
    {
        // Looking for pubtype with at least one searchable field
        $pubtypes = Clip_Util::getPubType(-1)->toArray();

        $searchable = Doctrine_Core::getTable('Clip_Model_Pubfield')
                      ->selectFieldArray('tid', "issearchable = '1'", '', true);

        foreach ($pubtypes as $key => $pubtype)
        {
            if (!in_array($key, $searchable)) {
                unset($pubtypes[$key]);
            }
        }

        return $pubtypes;
    }
}
