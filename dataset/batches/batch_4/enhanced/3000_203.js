setcpm(100)

$: s("gm_electric_guitar_jazz gm_synth_strings_1").struct("x(5,8,-1)").gain(.3).lpf(1500).gain(.4)

$: s("gm_piano gm_string_ensemble_2 gm_piccolo gm_drawbar_organ sd*3").gain(.2).lpf(1500).gain(.4)

$: note("0 1 4!3 12 2 a#5 g#5 c#4 e4 b4 d#5 c#4 g#3 b4 f#5 e5 c#4").s("gm_electric_bass_finger:2 bd*4").speed(1.002).room(.6).delay(.6).delaytime(.08).delayfeedback(.5).orbit(2).bank("RolandTR909").gain(.8)

$: note("c1 f1 g1 a#1 eb g bb c4 d4 eb4 g4 bb4").lpf(3000).resonance(5).gain(.8133).clip(.95).release(.1).attack(.001)
