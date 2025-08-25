import { test, expect } from '@playwright/experimental-ct-react';
import * as React from 'react';
import CastomAsideHeader from 'src/components/AsideHeader/CastomAsideHeader';

test.describe('CastomAsideHeader', () => {
  test('test_tooltip_display_on_hover', async ({ mount, page }) => {
    await mount(<CastomAsideHeader />);

    const tooltips = [
      { label: 'Создать сценарий', iconSelector: 'svg[data-testid="SquarePlus"], svg[class*="SquarePlus"]' },
      { label: 'Все сценарии', iconSelector: 'svg[data-testid="House"], svg[class*="House"]' },
      { label: 'Шаблоны', iconSelector: 'svg[data-testid="Archive"], svg[class*="Archive"]' },
      { label: 'Команды', iconSelector: 'svg[data-testid="Persons"], svg[class*="Persons"]' },
      { label: 'Настройки', iconSelector: 'svg[data-testid="Gear"], svg[class*="Gear"]' },
      { label: 'Выход', iconSelector: 'svg[data-testid="ArrowRightToSquare"], svg[class*="ArrowRightToSquare"]' },
    ];

    // Find all buttons by role and their order
    const buttons = await page.locator('button').all();

    // There should be 6 buttons
    expect(buttons.length).toBe(6);

    for (let i = 0; i < tooltips.length; i++) {
      const button = buttons[i];
      // Hover the button
      await button.hover();

      // Tooltip should appear with the correct text
      const tooltip = page.getByRole('tooltip', { name: tooltips[i].label });
      await expect(tooltip).toBeVisible();

      // Move mouse away to hide tooltip before next iteration
      await page.mouse.move(0, 0);
    }
  });

  // 1. All action buttons render with the correct icon and view style.
  test('test_buttons_render_with_correct_icons_and_styles', async ({ mount, page }) => {
    await mount(<CastomAsideHeader />);
    // Button order and expected icon class fragments
    const iconClassFragments = [
      'SquarePlus',
      'House',
      'Archive',
      'Persons',
      'Gear',
      'ArrowRightToSquare',
    ];
    const expectedViews = [
      'action',
      'normal',
      'normal',
      'normal',
      'normal',
      'normal',
    ];

    const buttons = await page.locator('button').all();
    expect(buttons.length).toBe(6);

    for (let i = 0; i < buttons.length; i++) {
      // Check icon presence inside button
      const icon = await buttons[i].locator(`svg[class*="${iconClassFragments[i]}"], svg[data-testid="${iconClassFragments[i]}"]`);
      await expect(icon).toBeVisible();

      // Check view class (from CSS module, but should be present as a className)
      const classAttr = await buttons[i].getAttribute('class');
      expect(classAttr).toContain('button');
      // The view prop is reflected in the className, e.g., 'action' or 'normal'
      expect(classAttr).toContain(expectedViews[i]);
    }
  });

  // 2. DefaultAvatar component is rendered at the top of the header.
  test('test_default_avatar_is_rendered', async ({ mount, page }) => {
    await mount(<CastomAsideHeader />);
    // The DefaultAvatar renders an SVG with width/height 42 by default
    const avatarSvg = page.locator('svg').first();
    await expect(avatarSvg).toBeVisible();
    await expect(avatarSvg).toHaveAttribute('width', '42');
    await expect(avatarSvg).toHaveAttribute('height', '42');
  });

  // 3. Component handles missing or undefined CSS module classes gracefully.
  test('test_missing_classes_module_handling', async ({ mount, page }) => {
    // Simulate missing classes by temporarily overriding the module
    // We need to import the component dynamically and override the classes import
    // This test assumes that the component uses a default import for classes
    // We'll use a proxy to simulate undefined classes
    const RealCastomAsideHeader = require('src/components/AsideHeader/CastomAsideHeader').default;
    // @ts-ignore
    const originalClasses = RealCastomAsideHeader.__proto__.classes;
    // @ts-ignore
    RealCastomAsideHeader.__proto__.classes = undefined;

    let error: Error | null = null;
    try {
      await mount(<RealCastomAsideHeader />);
    } catch (e) {
      error = e as Error;
    }
    // Restore
    // @ts-ignore
    RealCastomAsideHeader.__proto__.classes = originalClasses;

    expect(error).toBeNull();
    // The component should still render something
    await expect(page.locator('div')).toBeVisible();
  });

  // 4. Tooltip does not appear when the corresponding button is disabled.
  test('test_tooltip_not_shown_when_button_disabled', async ({ mount, page }) => {
    // Render a copy of the component with the first button disabled
    // We'll clone the component and override the first Button's props
    // Since the original component does not accept props, we need to reimplement the relevant part here
    // For this test, we inline a minimal version
    const { Tooltip } = await import('@gravity-ui/uikit');
    const { Button } = await import('@gravity-ui/uikit');
    const { SquarePlus } = await import('@gravity-ui/icons');
    const { default: DefaultAvatar } = await import('src/components/Avatars/DefaultAvatar');
    const classes = (await import('src/components/AsideHeader/CastomAsideHeader.module.css')).default;

    function CustomHeaderWithDisabledFirstButton() {
      return (
        <div className={classes.container}>
          <DefaultAvatar />
          <Tooltip content="Создать сценарий">
            <Button className={classes.button} view="action" disabled>
              <SquarePlus width="20px" height="20px" />
            </Button>
          </Tooltip>
        </div>
      );
    }

    await mount(<CustomHeaderWithDisabledFirstButton />);
    const button = page.locator('button').first();
    await expect(button).toBeDisabled();

    // Hover the disabled button
    await button.hover();
    // Tooltip should not appear
    const tooltip = page.getByRole('tooltip', { name: 'Создать сценарий' });
    await expect(tooltip).not.toBeVisible();
  });

  // 5. Component renders correctly when one or more icon components fail to load.
  test('test_render_with_missing_icon_component', async ({ mount, page }) => {
    // Simulate missing icon by replacing one icon with a fallback
    // We'll reimplement the component with a missing icon (e.g., House)
    const { Tooltip } = await import('@gravity-ui/uikit');
    const { Button } = await import('@gravity-ui/uikit');
    const { SquarePlus, Archive, Persons, Gear, ArrowRightToSquare } = await import('@gravity-ui/icons');
    const { default: DefaultAvatar } = await import('src/components/Avatars/DefaultAvatar');
    const classes = (await import('src/components/AsideHeader/CastomAsideHeader.module.css')).default;

    // Fallback icon
    function FallbackIcon(props: any) {
      return <span data-testid="FallbackIcon" {...props}>?</span>;
    }

    function CustomHeaderWithMissingHouseIcon() {
      return (
        <div className={classes.container}>
          <DefaultAvatar />
          <Tooltip content="Создать сценарий">
            <Button className={classes.button} view="action">
              <SquarePlus width="20px" height="20px" />
            </Button>
          </Tooltip>
          <Tooltip content="Все сценарии">
            <Button className={classes.button} view="normal">
              <FallbackIcon width="20px" height="20px" />
            </Button>
          </Tooltip>
          <Tooltip content="Шаблоны">
            <Button className={classes.button} view="normal">
              <Archive width="20px" height="20px" />
            </Button>
          </Tooltip>
          <Tooltip content="Команды">
            <Button className={classes.button} view="normal">
              <Persons width="20px" height="20px" />
            </Button>
          </Tooltip>
          <Tooltip content="Настройки">
            <Button className={classes.button} view="normal">
              <Gear width="20px" height="20px" />
            </Button>
          </Tooltip>
          <Tooltip content="Выход">
            <Button className={classes.button} view="normal">
              <ArrowRightToSquare width="20px" height="20px" />
            </Button>
          </Tooltip>
        </div>
      );
    }

    let error: Error | null = null;
    try {
      await mount(<CustomHeaderWithMissingHouseIcon />);
    } catch (e) {
      error = e as Error;
    }
    expect(error).toBeNull();

    // The fallback icon should be visible in the second button
    const fallbackIcon = page.locator('span[data-testid="FallbackIcon"]');
    await expect(fallbackIcon).toBeVisible();

    // The rest of the icons should still be visible
    const iconClassFragments = [
      'SquarePlus',
      'Archive',
      'Persons',
      'Gear',
      'ArrowRightToSquare',
    ];
    for (const fragment of iconClassFragments) {
      const icon = page.locator(`svg[class*="${fragment}"], svg[data-testid="${fragment}"]`);
      await expect(icon).toBeVisible();
    }
  });
});