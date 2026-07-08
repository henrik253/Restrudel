setcpm(100/4)

$: note("a3 b3").scale("c2:minor").sound("bd hh").lpf(800).room(.4065).gain("[1 0.7]*4").release(.5).attack(.2)

$: note("g4 bb4").scale("c2:minor").struct("[x]*3").gain(0.4)
