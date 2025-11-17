// Final test with user's exact text
const fs = require('fs');

// Read the popup.js file to get the conversion function
const popupCode = fs.readFileSync('popup.js', 'utf8');

// Execute it to get the convertLatexToUnicode function
eval(popupCode.replace('console.log', '// console.log').replace(/document\..*/g, ''));

const userText = `Moment of Inertia, or rotational inertia ($I$), is the rotational equivalent of mass. While mass describes an object's resistance to linear acceleration, the moment of inertia describes an object's resistance to angular acceleration ($\\alpha$). It is a fundamental property of a rotating body that depends on both its total mass ($M$) and how that mass is distributed relative to the axis of rotation ($R$). For a uniform solid disk, the theoretical moment of inertia is given by:

$$I_{\\text{theo\\_disk}} = \\frac{1}{2}MR^2$$

This experiment determines the moment of inertia experimentally by applying Newton's Second Law for Rotation, $\\sum \\tau = I\\alpha$. This principle states that a net external torque ($\\tau$) applied to an object will cause an angular acceleration ($\\alpha$) that is inversely proportional to the object's moment of inertia ($I$). By rearranging this to $I = \\frac{\\tau}{\\alpha}$, we can find the experimental moment of inertia by measuring the applied torque and the resulting acceleration.

The angular acceleration ($\\alpha$) is measured directly by finding the slope of the angular velocity vs. time graph from the Rotary Motion Sensor. The torque ($\\tau$) is supplied by a hanging mass ($m$) attached to a string wrapped around the sensor's pulley of radius ($r$). This torque is caused by the string's tension ($T$), giving $\\tau = Tr$. The tension is found using Newton's Second Law on the hanging mass: $\\sum F = mg - T = ma$, which gives $T = m(g - a)$. Substituting this into the torque equation, we get $\\tau = m(g - a)r$.

By substituting the expressions for $\\tau$ and $\\alpha$ (using the no-slip condition $a = \\alpha r$) into the rotational dynamics equation, we can solve for the total moment of inertia:

$$I_{\\text{total}} = \\frac{\\tau}{\\alpha} = \\frac{m(g - a)r}{(a/r)} = \\frac{m r^2 (g - a)}{a}$$

This formula gives the total inertia of the rotating system. To find the moment of inertia of the disk alone, the inertia of the sensor ($I_{\\text{sensor}}$) must be measured in a separate trial and subtracted: $I_{\\text{disk\\_only}} = I_{\\text{total}} - I_{\\text{sensor}}$.`;

console.log('==================================================');
console.log('FINAL TEST: User\'s Exact Text');
console.log('==================================================\n');

const result = convertLatexToUnicode(userText);

console.log('CONVERTED OUTPUT:');
console.log('==================================================');
console.log(result);
console.log('==================================================\n');

// Check for the bugs the user reported
const hasPipeEverywhere = result.includes('‖I‖‖');
const hasCorrectTheoDisk = result.includes('Iₜₕₑₒ_dᵢₛₖ');
const hasCorrectTotal = result.includes('Iₜₒₜₐₗ');
const hasCorrectSensor = result.includes('Iₛₑₙₛₒᵣ');
const hasCorrectDiskOnly = result.includes('Idᵢₛₖ_ₒₙₗy');
const hasCorrectFractions = result.includes('(1)/(2)');

console.log('VALIDATION CHECKS:');
console.log('✓ No pipe characters everywhere (‖I‖‖):', !hasPipeEverywhere ? 'PASS' : 'FAIL');
console.log('✓ Correct I_theo_disk subscript:', hasCorrectTheoDisk ? 'PASS' : 'FAIL');
console.log('✓ Correct I_total subscript:', hasCorrectTotal ? 'PASS' : 'FAIL');
console.log('✓ Correct I_sensor subscript:', hasCorrectSensor ? 'PASS' : 'FAIL');
console.log('✓ Correct I_disk_only subscript:', hasCorrectDiskOnly ? 'PASS' : 'FAIL');
console.log('✓ Correct fraction conversion:', hasCorrectFractions ? 'PASS' : 'FAIL');

const allPassed = !hasPipeEverywhere && hasCorrectTheoDisk && hasCorrectTotal &&
                  hasCorrectSensor && hasCorrectDiskOnly && hasCorrectFractions;

console.log('\n' + '='.repeat(50));
console.log(allPassed ? '🎉 ALL CHECKS PASSED!' : '❌ SOME CHECKS FAILED');
console.log('='.repeat(50));

process.exit(allPassed ? 0 : 1);
