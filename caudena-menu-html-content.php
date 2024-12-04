<?php
/**
 * Plugin Name: Caudena Menu HTML Content
 * Description: A plugin to add Gutenberg editor to custom fields in menu items.
 * Version: 1.0.0
 * Author: Caudena
 * Text Domain: caudena-menu-html-content
 */

// Exit if accessed directly.
if (! defined('ABSPATH') ) {
    exit;
}

/**
 * Add custom field to menu items
 */
function caudena_add_menu_item_custom_field( $item_id, $item, $depth, $args )
{
    ?>
      <div class="menu-item-custom-field">
         <label for="edit-menu-item-custom-<?php echo $item_id; ?>">
         <?php _e('Custom HTML Content', 'textdomain'); ?><br>
            <textarea id="edit-menu-item-custom-<?php echo $item_id; ?>" class="widefat edit-menu-custom" name="menu-item-custom[<?php echo $item_id; ?>]"><?php echo esc_textarea(get_post_meta($item_id, '_menu_item_custom', true)); ?></textarea>
         </label>
         <div id="editor-container-<?php echo $item_id; ?>" class="edit-menu-item-custom">
            Loading Editor...
         </div>
      </div>
    <?php
}
add_action('wp_nav_menu_item_custom_fields', 'caudena_add_menu_item_custom_field', 10, 4);

function register_custom_menu_item_meta()
{
    register_meta(
        'post', '_menu_item_custom', array(
        'show_in_rest' => true,
        'single' => true,
        'type' => 'string',
        )
    );
}
add_action('init', 'register_custom_menu_item_meta');

/**
 * save content of custom field
 */
function caudena_save_menu_item_custom_field( $menu_id, $menu_item_db_id )
{
    if (isset($_POST['menu-item-custom'][$menu_item_db_id]) ) {
        update_post_meta($menu_item_db_id, '_menu_item_custom', sanitize_text_field($_POST['menu-item-custom'][$menu_item_db_id]));
    }
}
add_action('wp_update_nav_menu_item', 'caudena_save_menu_item_custom_field', 10, 2);

/**
 * Add styles to Gutenberg editor custom field of menu items
 */
function caudena_enqueue_gutenberg_assets()
{
    wp_enqueue_script(
        'caudena-menu-editor-script',
        plugins_url('build/index.js', __FILE__),
        array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-data', 'wp-compose', 'react', 'react-dom' ),
        filemtime(plugin_dir_path(__FILE__) . 'build/index.js'),
        true
    );
    wp_enqueue_style('wp-edit-blocks');
}
add_action('admin_enqueue_scripts', 'caudena_enqueue_gutenberg_assets');
