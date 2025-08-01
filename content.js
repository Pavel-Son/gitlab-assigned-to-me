// GitLab Assigned to Me Filter Extension
(function() {
    'use strict';

    // Wait for page to load and check if we're on a GitLab merge requests page
    function init() {
        if (isGitLabMergeRequestsPage()) {
            addAssignedToMeButton();
        }
    }

    // Check if current page is GitLab merge requests page
    function isGitLabMergeRequestsPage() {
        const url = window.location.href;
        const isGitLab = document.querySelector('.navbar-gitlab') ||
                        document.querySelector('[data-qa-selector="gitlab_logo"]') ||
                        document.querySelector('.header-logo') ||
                        url.includes('gitlab');
        const isMergeRequestsPage = url.includes('merge_requests') ||
                                   url.includes('/-/merge_requests');

        return isGitLab && isMergeRequestsPage;
    }

    // Add "Assigned to Me" button to the page
    function addAssignedToMeButton() {
        // Try to find the filter controls area
        const filterContainer = findFilterContainer();

        if (filterContainer && !document.getElementById('assigned-to-me-btn')) {
            const button = createAssignedToMeButton();
            filterContainer.appendChild(button);
        }
    }

    // Find the appropriate container for the button
    function findFilterContainer() {
        // Try different selectors for GitLab filter areas
        const selectors = [
            '.nav-controls',
            '.content-wrapper .nav-controls',
            '.merge-requests-holder .nav-controls',
            '.filtered-search-wrapper',
            '.vue-filtered-search-bar-container',
            '.issuable-list-container .nav-controls',
            '.top-area .nav-controls'
        ];

        for (const selector of selectors) {
            const container = document.querySelector(selector);
            if (container) {
                return container;
            }
        }

        // Fallback: create container if none found
        const contentWrapper = document.querySelector('.content-wrapper') ||
                              document.querySelector('.page-content-header') ||
                              document.querySelector('main');

        if (contentWrapper) {
            const fallbackContainer = document.createElement('div');
            fallbackContainer.className = 'assigned-to-me-container';
            contentWrapper.insertBefore(fallbackContainer, contentWrapper.firstChild);
            return fallbackContainer;
        }

        return null;
    }

    // Create the "Assigned to Me" button
    function createAssignedToMeButton() {
        const button = document.createElement('button');
        button.id = 'assigned-to-me-btn';
        button.className = 'btn btn-default assigned-to-me-button';
        button.innerHTML = '👤 Assigned to Me';
        button.title = 'Filter merge requests assigned to me';

        button.addEventListener('click', function() {
            applyAssignedToMeFilter();
        });

        return button;
    }

    // Apply the "assigned to me" filter
    function applyAssignedToMeFilter() {
        const currentUser = getCurrentUser();

        if (!currentUser) {
            alert('Could not determine current user. Please make sure you are logged in to GitLab.');
            return;
        }

        // Try different methods to apply the filter
        if (!applyFilterViaURL(currentUser)) {
            applyFilterViaSearch(currentUser);
        }
    }

    // Get current GitLab user
    function getCurrentUser() {
        // Try to get username from the user dropdown menu
        const usernameElement = document.querySelector('.gl-break-all.gl-text-subtle');
        if (usernameElement && usernameElement.textContent.startsWith('@')) {
            return usernameElement.textContent.replace('@', '');
        }

        // Try to get from user profile link in dropdown
        const profileLink = document.querySelector('[data-testid="user-profile-link"]');
        if (profileLink) {
            const href = profileLink.getAttribute('href');
            if (href && href.startsWith('/')) {
                return href.substring(1); // Remove leading slash
            }
        }

        // Try to get user from various GitLab elements (legacy selectors)
        const userElements = [
            document.querySelector('[data-user]'),
            document.querySelector('.header-user-dropdown-toggle'),
            document.querySelector('.user-avatar'),
            document.querySelector('[data-qa-selector="user_avatar"]'),
            document.querySelector('[data-testid="user-menu-toggle"]'),
            document.querySelector('[data-testid="user-avatar-content"]')
        ];

        for (const element of userElements) {
            if (element) {
                const username = element.getAttribute('data-user') ||
                               element.getAttribute('data-username') ||
                               element.getAttribute('title');
                if (username) {
                    return username.replace('@', '');
                }
            }
        }

        // Try to get from URL or page content
        const userMatch = document.body.innerHTML.match(/gon\.current_username\s*=\s*"([^"]+)"/);
        if (userMatch) {
            return userMatch[1];
        }

        // Try to get from meta tags
        const userMeta = document.querySelector('meta[name="user"]');
        if (userMeta) {
            return userMeta.getAttribute('content');
        }

        return null;
    }

    // Apply filter via URL modification
    function applyFilterViaURL(username) {
        const url = new URL(window.location.href);
        url.searchParams.set('assignee_username', username);

        // Remove conflicting parameters
        url.searchParams.delete('assignee_id');

        window.location.href = url.toString();
        return true;
    }

    // Apply filter via search input (fallback method)
    function applyFilterViaSearch(username) {
        const searchInput = document.querySelector('input[placeholder*="Search"]') ||
                           document.querySelector('.filtered-search-input') ||
                           document.querySelector('input[type="search"]');

        if (searchInput) {
            searchInput.value = `assignee:@${username}`;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            return true;
        }

        return false;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-initialize on navigation (for SPA behavior)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(init, 1000); // Delay to allow page to load
        }
    }).observe(document, { subtree: true, childList: true });

})();
