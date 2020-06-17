<?php // phpcs:ignore WordPress.Files.FileName

/**
 * ReduxTemplates InstallerMuter.
 *
 * @since 4.0.0
 */
namespace ReduxTemplates;
use ReduxTemplates;

class InstallerMuter extends \WP_Upgrader_Skin {
	/**
	 * Suppress feedback.
	 *
	 * @param string|null $string A string.
	 * @param array|null  ...$args Passed args.
	 * @return void
	 * @since 4.0.0
	 */
	public function feedback( $string, ...$args ) {
		/* no output */ }
}
