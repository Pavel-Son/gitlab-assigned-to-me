// GitLab Assigned to Me Filter Extension
(function() {
    'use strict';

    // Wait for page to load and check if we're on a GitLab merge requests page
    function init() {
        if (isGitLabMergeRequestsPage()) {
            addFilterButtons();
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

        // Exclude individual MR pages (URLs ending with /merge_requests/123)
        const isIndividualMRPage = /\/merge_requests\/\d+(?:\/|$)/.test(url);

        return isGitLab && isMergeRequestsPage && !isIndividualMRPage;
    }

    // Add both buttons to the page
    function addFilterButtons() {
        // Try to find the filter controls area
        const filterContainer = findFilterContainer();

        if (filterContainer) {
            // Add "My MRs" button if it doesn't exist
            if (!document.getElementById('my-mrs-btn')) {
                const myMRsButton = createMyMRsButton();
                filterContainer.appendChild(myMRsButton);
            }

            // Add "Assigned to Me" button if it doesn't exist
            if (!document.getElementById('assigned-to-me-btn')) {
                const assignedButton = createAssignedToMeButton();
                filterContainer.appendChild(assignedButton);
            }
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

    // Create the "My MRs" button
    function createMyMRsButton() {
        const button = document.createElement('button');
        button.id = 'my-mrs-btn';
        button.className = 'btn btn-default my-mrs-button';
        button.innerHTML = 'My MRs';
        button.title = 'Filter merge requests created by me';

        button.addEventListener('click', function() {
            applyMyMRsFilter();
        });

        return button;
    }

    // Create the "Assigned to Me" button
    function createAssignedToMeButton() {
        const button = document.createElement('button');
        button.id = 'assigned-to-me-btn';
        button.className = 'btn btn-default assigned-to-me-button';
        button.innerHTML = 'Assigned To me';
        button.title = 'Filter merge requests assigned to me for review';

        button.addEventListener('click', function() {
            applyAssignedToMeFilter();
        });

        return button;
    }

    // Apply the "My MRs" filter (created by me)
    function applyMyMRsFilter() {
        const currentUser = getCurrentUser();

        if (!currentUser) {
            alert('Could not determine current user. Please make sure you are logged in to GitLab.');
            return;
        }

        // Try different methods to apply the filter
        if (!applyMyMRsFilterViaURL(currentUser)) {
            applyMyMRsFilterViaSearch(currentUser);
        }
    }

    // Apply the "assigned to me" filter (reviewer)
    function applyAssignedToMeFilter() {
        const currentUser = getCurrentUser();

        if (!currentUser) {
            alert('Could not determine current user. Please make sure you are logged in to GitLab.');
            return;
        }

        // Try different methods to apply the filter
        if (!applyAssignedToMeFilterViaURL(currentUser)) {
            applyAssignedToMeFilterViaSearch(currentUser);
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

    // Apply "My MRs" filter via URL modification (author)
    function applyMyMRsFilterViaURL(username) {
        const url = new URL(window.location.href);
        url.searchParams.set('author_username', username);

        // Remove conflicting parameters
        url.searchParams.delete('author_id');
        url.searchParams.delete('reviewer_username');
        url.searchParams.delete('reviewer_id');
        url.searchParams.delete('assignee_username');
        url.searchParams.delete('assignee_id');

        window.location.href = url.toString();
        return true;
    }

    // Apply "My MRs" filter via search input (fallback method)
    function applyMyMRsFilterViaSearch(username) {
        const searchInput = document.querySelector('input[placeholder*="Search"]') ||
                           document.querySelector('.filtered-search-input') ||
                           document.querySelector('input[type="search"]');

        if (searchInput) {
            searchInput.value = `author:@${username}`;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            return true;
        }

        return false;
    }

    // Apply "Assigned to me" filter via URL modification (reviewer)
    function applyAssignedToMeFilterViaURL(username) {
        const url = new URL(window.location.href);
        url.searchParams.set('reviewer_username', username);

        // Remove conflicting parameters
        url.searchParams.delete('reviewer_id');
        url.searchParams.delete('author_username');
        url.searchParams.delete('author_id');
        url.searchParams.delete('assignee_username');
        url.searchParams.delete('assignee_id');

        window.location.href = url.toString();
        return true;
    }

    // Apply "Assigned to me" filter via search input (fallback method)
    function applyAssignedToMeFilterViaSearch(username) {
        const searchInput = document.querySelector('input[placeholder*="Search"]') ||
                           document.querySelector('.filtered-search-input') ||
                           document.querySelector('input[type="search"]');

        if (searchInput) {
            searchInput.value = `reviewer:@${username}`;
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
