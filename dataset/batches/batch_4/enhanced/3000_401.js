setcpm(120/4)

$: s("kick snare").gain(.7)

$: s("sawtooth square").lpf(2792).room(.6775).gain(.8).release(.0574).attack(.08).velocity(0).pan(.6)

$: note("c4 eb4 g4 bb4").struct("x*8").s("sawtooth")
