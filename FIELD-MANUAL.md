# NULLFRONT: Frontier Wars

An original, native science-fiction real-time strategy game built in Unreal Engine 5.8. Play **The Quiet Meridian** story campaign, or command one of three factions in a skirmish. This manual covers version **0.6.0**.

## Deploy

Download the Mac release, extract the ZIP, and move **NULLFRONT.app** into Applications. Open the app to begin.

Press **F6** or choose **Story Campaign** for the campaign. For a skirmish, choose your faction, an enemy faction or **Random**, and **Easy**, **Normal**, **Hard**, or **Brutal** difficulty. Choose a battlefield, then select **Launch Skirmish** or press **Enter**. Skirmish victory requires destroying every enemy structure.

- **Ashfall Mesa:** dusk highlands, a central mesa, and open flanks.
- **Frostglass Rift:** frozen plateaus, a central chasm, a narrow ice bridge, and flank passes.

**Rapid Deployment** is on by default. You begin with 12 workers, a starter base, a mixed strike force, 250 Crystal, and 75 Flux. Toggle it to **Classic Build-up** for the original opening: a headquarters, 10 workers, and 50 Crystal, with no relay objective.

Select **Watch Battle** (or press **F9** at the title screen) for an immediate combined-arms clash using your chosen factions and battlefield. It starts in cinematic view and continues as a real AI skirmish. **Field Manual** opens the controls. **Graphics** cycles Cinematic → Balanced → Performance → Low and saves your choice; it is also available in the pause menu. Balanced is the new default, targeting steady 60 fps with dynamic lighting, detailed models, and effects. Choose Performance or Low for more rendering headroom, or Cinematic for full internal resolution and higher lighting quality. The game caps rendering at 60 fps; actual performance depends on the scene and hardware.

The opening cinematic introduces the silent colony and the Meridian. Press any key to skip it. Choose **Watch Intro** or press **F7** at the title screen to replay it.

## The Quiet Meridian

A colony has been silent for eleven days. When its relay transmits a child's voice, Commander Ada Voss disobeys her demolition orders and leads a recovery team into Ashfall. Engineer Ilya Senn helps reconstruct the signal; the search draws them into a war beneath Frostglass.

The campaign follows **the Concord** through four authored missions. Each starts with a prepared base, workers, an army, Voss, and **700 Crystal / 350 Flux**. The skirmish faction, difficulty, and deployment choices do not change campaign missions. You can build your economy, train reinforcements, and use the regular command controls.

At the chapter selector, use **↑ / ↓** or click an unlocked chapter. **Enter** opens its briefing; **Enter** again deploys. Briefings pause the mission. During play, read the **Primary Objective** panel and use **Locate** to center the camera on its current target. In chapter three, resonators also have battlefield markers.

| Chapter | Mission | How to complete it |
|---|---|---|
| **01 · The Last Transmission** | Recover the signal on Ashfall Mesa. | Capture the central relay and hold it uncontested for **45 consecutive game seconds**. An enemy contest or takeover resets the hold timer. |
| **02 · A Bridge of Glass** | Protect the Frostglass evacuation. | Defend your landing headquarters and Voss for **180 game seconds** while enemy waves approach. |
| **03 · The Enemy's Voice** | Silence the signal's defenses on Ashfall Mesa. | Destroy **all three marked resonators**, then control the central relay without an enemy contest. |
| **04 · Dawn Beyond the Front** | Shut down the Meridian on Frostglass Rift. | Accumulate **75 game seconds** of uncontested relay control, then destroy the exposed **Heart**. Fighting pauses uplink progress; uncontested enemy ownership drains it at half speed. The Heart cannot be damaged until the uplink finishes. |

**Voss and your headquarters must survive every chapter.** Keep reinforcements flowing and pull Voss back from concentrated fire. A mission ends in failure if either is destroyed. Victory follows the listed objective; clearing every enemy building is unnecessary in the campaign.

After a victory, **Enter** continues to the next chapter. After a defeat, **Enter** retries the current mission. Completing a chapter unlocks the next and saves that unlock automatically; completed chapters remain available for replay. Only chapter unlocks are saved—leaving during a mission means starting that chapter again.

## Your first offensive

Your starting workers gather Crystal automatically. Keep training workers and reinforcements, build supply before you hit the limit, and place an extractor on a Flux vent for advanced technology. Select a production structure and right-click the ground to set a rally point.

In Rapid Deployment, press **F2** to select your army. Use the objective panel's **Locate** button to find the relay, then **A + click** nearby to advance while engaging enemies.

Keep ground combat troops inside the relay ring for **10 game seconds** to capture it. Workers, aircraft, and temporary summons cannot capture or contest it. Owning the relay adds **4 Crystal and 1 Flux per game second**, even after your army moves away. Enemy ground troops in the ring interrupt that income; opposing armies in the ring freeze capture progress. Retake it or push for the enemy base—the victory condition remains destroying every enemy structure.

Failed ability targeting stays active so you can correct the aim immediately; press **Esc** to cancel.

## Choose your faction

| Faction | How it fights | Hero |
|---|---|---|
| **The Concord** | Armored industry and siege fire. Riggers stay to weld buildings. Supply Drops extend your capacity; Hammers deploy for long-range bombardment. | **Commander Ada Voss** calls down Orbital Lances. |
| **The Bloom** | A living swarm. Build on mycelium spread by Pulse Trees. Creatures regenerate and move faster on it; Raveners hatch in pairs. | **Veyla, Mother of Thorns** |
| **The Lumen** | Shields and hard-light technology. Weavers start constructs and can immediately move on. Shields regenerate out of combat. | **Aurelion, the First Light** |

Each faction has its own workers, combat units, hero, production structures, defenses, research, and active abilities. Hover command buttons to inspect costs, requirements, and hotkeys.

## Read the heavy attacks

A sieged Hammer charges for **0.45 seconds**, a Behemoth winds up for **0.40 seconds**, and a Luminar charges for **0.65 seconds** before releasing its attack. Weapon glow and ground markings announce the threat. Haste shortens these times.

The Luminar commits to the marked beam lane: move sideways to escape it. Close inside a sieged Hammer’s minimum range or withdraw from melee reach before a Behemoth releases. Your move or cast orders cancel an unfired charge; ordinary incoming damage does not stun-lock the attacker. Sustained weapon cooldowns and damage values remain unchanged.

## Controls

| Input | Action |
|---|---|
| Left click / drag | Select units; Shift adds; Ctrl, Command, or double-click selects units of the same type |
| Right click | Move, attack, gather, repair, or set a rally point, depending on the target |
| A, then click | Attack-move |
| S / H / P | Stop / hold position / patrol |
| B / V | Worker build menus |
| Q W E R T… | Command card hotkeys; hover a button for details |
| Shift + command | Queue orders |
| Shift + train | Queue five units |
| Ctrl or Command + 0–9 | Assign a control group |
| Shift + 0–9 | Add selected units to a control group |
| 0–9 | Select a control group; double-tap to jump to it |
| F1 / F2 | Cycle through idle workers / select your complete army |
| Backspace | Cycle through your bases |
| Space | Jump to the last alert |
| Arrows / screen edge / middle-drag | Pan the camera |
| Mouse wheel | Zoom |
| Minimap left click / right click | Move the camera / issue a command |
| Alt | Show all health bars |
| + / − | Increase / decrease game speed |
| F6 at the title screen | Open the campaign chapter selector |
| F7 at the title screen | Replay the opening cinematic |
| ↑ / ↓ in the chapter selector | Choose an unlocked chapter |
| Enter in campaign menus | Begin chapter, deploy, continue, or retry |
| F8 | Toggle cinematic view |
| F9 at the title screen | Launch a cinematic battle |
| Esc | Cancel the current targeting/build action, or open the pause menu |
| F10 | Open the pause menu |

**Cinematic view:** F8 eases into a lower angle while slowly orbiting your current view. The Cinematic graphics profile also adds depth of field; other profiles keep units in sharp focus. It hides the command interface, cursor, selection rings, and tactical relay markers. In observed AI matches, the camera follows active battles and moves in for close views of units; manual panning, middle-dragging, or zooming suspends this for six seconds. Arrows pan and the wheel zooms. The battle continues; press F8 again to return to command.

The stereo soundtrack crossfades between **Frontier** and **Onslaught** as nearby fighting intensifies. Weapon sounds follow their position on screen, including while the camera turns; distant sounds soften.

The pause menu offers **Resume**, **Controls**, **Surrender**, **Graphics**, and **Quit to Title**.

Campaign paintings and character concepts include AI-generated artwork. Character, vehicle, structure, and scenery assets use Nano Banana Pro concepts and Meshy models generated through Fal. Animated characters also use Meshy rigs and animations, with game-specific aiming, blending, and articulated model parts. The opening cinematic uses MiniMax H3 Max via Fal.ai; its imagery is cinematic, not gameplay footage. Music and combat effects use ElevenLabs models through Fal. See the [project credits](README.md#credits) for further details.
