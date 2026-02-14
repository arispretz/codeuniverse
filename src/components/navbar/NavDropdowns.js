/**
 * @fileoverview Navigation dropdown categories for the CodeUniverse platform.
 * Defines the structure of the navigation menu used in the top navigation bar.
 * Each category contains labeled links with their corresponding routes.
 *
 * @module components/navbar/navDropdowns
 */

/**
 * Navigation dropdown configuration object.
 *
 * @constant
 * @readonly
 * @type {Object<string, Array<{label: string, to: string}>>}
 *
 * @example
 * // Usage in Navbar component
 * import { navDropdowns } from './NavDropdowns.js';
 *
 * Object.entries(navDropdowns).map(([category, items]) => (
 *   <NavCategory key={category} label={category} items={items} />
 * ));
 */
export const navDropdowns = {
  General: [
    { label: 'Home', to: '/' },
    { label: 'Blog', to: '/blog' },
    { label: 'Testimonials', to: '/testimonials' }
  ],
  Product: [
    { label: 'Features', to: '/features' },
    { label: 'AI Assistant', to: '/ai' }
  ],
  Developers: [
    { label: 'For Developers', to: '/developers' },
    { label: 'Docs / Help Center', to: '/help' }
  ],
};
