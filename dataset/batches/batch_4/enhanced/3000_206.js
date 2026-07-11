setcpm(100)

$: s("triangle hats*8").slow(16).room(.4).gain(.2)

$: note("~ 6 f2 g#2!3").sound("square hadoken").lpf(800).gain(.4)

$: note("c3 a#2 f2@3 ~ ~ f2 g#2!3 g2 a#2 d#3 c3@2 ~ 3 c3 g#2 c3 f3 a#2 g2 d#2 f2@3 ~ 3 72 g#3 g3 f3 c3@3 c3 d#3@2 c#3 c3").sound("kick snare").lpf(650).attack(.1).decay(.1).sustain(0).delay(.25).gain(.2).bank("RolandTR909")

$: s("cowbell ~").cutoff(500).resonance(12).gain(.5)
