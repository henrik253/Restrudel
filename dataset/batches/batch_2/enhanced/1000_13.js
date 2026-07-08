setcpm(90/4)
$: note("12 eb2 c2 a2").s("cymbal ~").gain(.7)
$: note("d5 c#5@2 a4@4 ~ c#5 a4@6 ~ c#5 a4@2 ~ c#5 a4@3 ~ a#4@2 f#4@2 g#4@2").s("sawtooth").gain("[1 0.6]*4").lpf(1800).room(.4)
$: note("a#5 g#5 c#4").sound("square supersaw").lpf(2630).gain(.4)
