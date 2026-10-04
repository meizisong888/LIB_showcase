"""Author the fixed synthetic fixture; not part of preprocessing.

Written with Codex, not sampled from a real catalog. Relevance rationales and
evidence are fixed here before retrieval is implemented or run.
"""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Title, complete description, local subjects, type, relevance rationale.
ROWS = [
    ("Appalachian community river flood interviews", "Residents of an Appalachian community describe the river flood of 1977. They organized boat rescues, shared meals and repaired the school after the water receded.", ["Floods", "Appalachia", "Oral history"], "oral history", "Residents describe a flood and collective recovery in Appalachia."),
    ("Appalachian river flood community photographs", "Photographs show an Appalachian community during a river flood. Captions identify families moving furniture upstairs and volunteers distributing clean water.", ["Floods", "Appalachia", "Photography"], "photographs", "Captions document residents' experience and relief work."),
    ("When the creek came through the door", "Families in a Blue Ridge settlement recall the 1940 inundation. Neighbors shared shelter and rebuilt footbridges after water overtopped the banks.", ["Local history", "Oral history"], "oral history", "Blue Ridge is the regional clue; inundation and shared shelter establish the topic without the query words."),
    ("Ridge settlement notebooks", "These notebooks were kept in an Appalachian village.\n\nThe final entries describe homes submerged when the river left its banks, followed by neighbors organizing shared shelter.", ["Local history", "Community life"], "diary", "Region and flood response are in different paragraphs; both are needed."),
    ("Appalachian community flood shelter register", "A register describes the Appalachian community response to a river flood: a school became a shelter and a kitchen served displaced households. The description summarizes activities only; no personal entries are included.", ["Floods", "Appalachia", "Community life"], "finding aid", "A shelter and kitchen demonstrate community response; access conditions must remain attached."),
    ("Appalachian community flood river simulation", "A classroom simulation uses the words Appalachian community, flood and river in an imaginary exercise. It explicitly excludes historical events, residents' experiences and community response evidence.", ["Weather", "Education"], "report", None),
    ("Seed saving in a mountain garden", "A practical book describes bean seed drying, germination tests and storage jars. Its contents concern garden cultivation and contain no astronomical observations.", ["Astronomy"], "book", None),
    ("Uncataloged valley interview", "", ["Oral history"], "audio", None),
    ("A flood of gifts for an Appalachian community river museum", "The museum newsletter calls a donation campaign a flood of gifts. Its Appalachian community river exhibit concerns boat construction; there is no water disaster or recovery account.", ["Local history", "Transportation"], "newspaper", None),
    ("Appalachian river flood relief ledger", "An Appalachian community recorded flood relief supplies after the river overflowed. Ledger headings distinguish temporary shelter, bridge repair and distribution of drinking water.", ["Floods", "Appalachia", "Community life"], "report", "Relief supplies and rebuilding follow an actual event within the fictional collection."),
    ("Coastal river flood community accounts", "This collection describes a coastal community in the Florida Keys responding to a river flood. The geographic scope excludes Appalachia.", ["Floods", "Community life"], "oral history", None),
    ("Appalachian river flood forecast grids", "Numerical grids estimate river flood probabilities in Appalachian watersheds. No accounts of community experience, local action or past relief work are present.", ["Weather", "Water management"], "dataset", None),
    ("Appalachian community flood anniversary exhibit", "An Appalachian community exhibit remembers the river flood. Recorded recollections describe evacuation routes and a neighborhood fund used to replace damaged household stoves.", ["Floods", "Appalachia", "Oral history"], "finding aid", "Recollections describe evacuation and neighborhood recovery."),
    ("Appalachian community river planning bibliography", "A bibliography lists titles about river engineering and flood models for an Appalachian community planning course. It contains no collection descriptions or evidence of residents experiencing or responding to floods.", ["Water management", "Education"], "book", None),
    ("Appalachian community river flood interviews", "Residents of an Appalachian community describe the river flood of 1977. This revised edition adds an interview about households excluded from the first relief distribution.", ["Floods", "Appalachia", "Oral history"], "oral history", "Revised edition changes the evidence and must not be grouped with the earlier edition."),
    ("Appalachian community river flood interviews", "Residents of an Appalachian community describe the river flood of 1977. They organized boat rescues, shared meals and repaired the school after the water receded.", ["Floods", "Appalachia", "Oral history"], "oral history", "Another copy retains the response account but has different copy and access information."),
    ("Memorias de la crecida", "En una aldea de las montañas Apalaches, el agua salió del cauce e inundó las casas. Las familias organizaron refugios y repararon el puente juntas.", ["Local history", "Oral history"], "oral history", "Spanish description locates the event in the Appalachian mountains and describes collective shelter and bridge repair."),
    ("County bridge inspection checklist", "Inspectors list masonry joints, deck wear and routine maintenance priorities. No disaster event or community response is described.", ["Transportation"], "report", None),
    ("Workshop dye sample sheets", "Fabric samples compare indigo baths and wool preparation in a textile workshop.", ["Textiles"], "photocopy", None),
    ("Mountain strata field guide", "A field guide illustrates rock layers and mineral identification along walking routes. One plate is withheld from the public scan under the demonstration access condition.", ["Conservation"], "book", None),
    ("Orchard pruning demonstration", "Photographs document seasonal apple pruning, tool care and grafting demonstrations.", ["Agriculture", "Photography"], "photographs", None),
    ("Depot platform survey", "Measured drawings describe a railway platform, shelter columns and ticket window dimensions.", ["Transportation", "Architecture"], "map", None),
    ("School reading room inventory", "An inventory lists desks, reading lamps and shelves purchased for a school reading room.", ["Education"], "report", None),
    ("Fiddle workshop recordings", "Audio tracks demonstrate bowing patterns and tuning for a fiddle workshop.", ["Music"], "audio", None),
    ("Observatory lens maintenance", "Technicians record cleaning procedures and alignment measurements for a telescope lens.", ["Astronomy"], "report", None),
    ("Quilt pattern notebook", "A notebook contains block diagrams, fabric measurements and stitching instructions.", ["Textiles"], "diary", None),
    ("Clinic building plans", "Floor plans show waiting rooms, ventilation routes and the placement of examination rooms.", ["Health", "Architecture"], "map", None),
    ("Portrait studio negatives", "Studio portraits illustrate backdrops, lighting arrangements and camera equipment.", ["Photography"], "photographs", None),
    ("Factory shift rules", "A handbook explains shift changes, tool checkout and wage categories at a small factory.", ["Labor"], "book", None),
    ("Trail marker atlas", "Maps locate trail junctions, elevation contours and designated camping areas.", ["Maps", "Conservation"], "map", None),
    ("Herbarium storage study", "A study compares cabinets and humidity control for dried plant specimens.", ["Conservation"], "report", None),
    ("Town clock repair diary", "A repairer records gear replacements, pendulum adjustments and winding routines.", ["Local history"], "diary", None),
    ("Preserving peaches booklet", "Recipes give preparation steps for jars, fruit syrups and pantry storage.", ["Cooking"], "book", None),
    ("Reservoir valve specifications", "Engineering sheets specify valve sizes, operating pressures and inspection intervals.", ["Water management"], "report", None),
    ("Market stall permit register", "A register records stall dimensions and permitted produce categories at a market.", ["Local history", "Agriculture"], "finding aid", None),
    ("Bookmobile route map", "A map marks regular bookmobile stops at schools and community centers.", ["Maps", "Education"], "map", None),
    ("Theater seating renovation", "Architectural drawings document aisle widths, balcony supports and replacement seats.", ["Architecture"], "map", None),
    ("Choral rehearsal schedule", "Programs list rehearsal pieces, voice sections and performance dates.", ["Music"], "finding aid", None),
    ("Lunar eclipse observing log", "Observers record eclipse timings, cloud cover and telescope magnification.", ["Astronomy", "Weather"], "diary", None),
    ("Spinning wheel repair notes", "Instructions explain spindle alignment, drive bands and wood treatment.", ["Textiles"], "book", None),
    ("Dental outreach equipment", "A report inventories portable chairs, lights and sterilization equipment.", ["Health"], "report", None),
    ("Darkroom chemistry cards", "Cards compare developer dilutions, exposure times and print washing procedures.", ["Photography"], "finding aid", None),
    ("Carpenters apprenticeship handbook", "Training chapters cover measuring, joints, tool maintenance and workshop safety.", ["Labor", "Education"], "book", None),
    ("Campus tree survey", "A dataset records tree species, trunk diameter and planted location.", ["Conservation"], "dataset", None),
    ("Bakery oven ledger", "A baker records oven temperatures, flour deliveries and daily bread batches.", ["Cooking", "Local history"], "diary", None),
    ("Bus shelter photographs", "Images document shelter roof designs, seating and route signs.", ["Transportation", "Photography"], "photographs", None),
    ("Library binding specifications", "Specifications describe cloth covers, sewing methods and paper grain for bindings.", ["Conservation"], "report", None),
    ("Pottery kiln firing notes", "Workshop notes record temperatures, glaze combinations and firing durations.", ["Local history"], "diary", None),
    ("Bee pasture planting guide", "A guide compares flowering periods and soil needs of plants used by beekeepers.", ["Agriculture"], "book", None),
    ("Weather station calibration", "Technicians compare thermometer readings and calibrate rain gauges before installation.", ["Weather"], "report", None),
    ("Canal lock mechanism drawings", "Drawings show gears, gate hinges and mechanical clearances at a canal lock.", ["Transportation", "Water management"], "map", None),
    ("Museum display case catalog", "A catalog lists case dimensions, glazing options and lighting fixtures.", ["Architecture", "Conservation"], "book", None),
    ("Language classroom recordings", "Audio exercises practice pronunciation and short dialogues about shopping and travel.", ["Education"], "audio", None),
    ("Brass band instrument register", "An inventory identifies instrument types, repair dates and storage lockers.", ["Music"], "finding aid", None),
    ("Star chart printing plates", "Printing plates show constellation outlines and reference coordinates.", ["Astronomy", "Maps"], "photographs", None),
    ("Weaving loom dimensions", "Technical drawings specify frame dimensions and treadle connections for a hand loom.", ["Textiles"], "map", None),
    ("Walking route accessibility survey", "A survey records pavement condition, gradients and bench spacing along a walking route.", ["Health", "Maps"], "report", None),
    ("Canning club recipe exchange", "A booklet collects vegetable preservation recipes and seasonal ingredient substitutions.", ["Cooking", "Community life"], "book", None),
]


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    if (ROOT / "data/raw/catalog-v1.jsonl").exists():
        raise SystemExit("Raw fixture already exists; refusing to overwrite it.")
    assert len(ROWS) == 58
    records, labels = [], []
    for i, (title, abstract, subjects, kind, reason) in enumerate(ROWS, 1):
        records.append({
            "id": f"R{i:03}", "title": title, "abstract": abstract,
            "subjects": subjects, "language": "es" if i == 17 else "en",
            "edition": "revised" if i == 15 else "first",
            "copy": "B" if i == 16 else "A",
            "date": "2021-02-30" if i == 18 else f"{1990 + i % 35}-06-15",
            "material_type": kind, "collection": "Synthetic teaching collection",
            "restrictions": {5: "Description open. Imaginary interview transcripts require reading-room permission; no personal entries supplied.", 16: "Copy B lacks the final audio track; do not infer what that track says.", 20: "Plate 4 withheld from the demonstration scan; description does not grant reuse permission."}.get(i, "Synthetic description open for reuse; no real collection item exists."),
            "status": "active", "source_locator": f"data/raw/catalog-v1.jsonl#L{i}",
            "import_batch": "teaching-export-01", "imported_at": "2026-10-04T00:00:00Z",
            "catalog_ui": {"expanded": False, "sort_position": i, "thumbnail": "placeholder.svg"},
            "local_shelf": f"DEMO/{kind}/{i:03}",
            "export_note": "Original synthetic metadata for workflow teaching; not a real holding.",
        })
        # Record-level review made at fixture authoring, before any scores exist.
        negative = {
            6: "Explicitly excludes real experiences and responses; lexical decoy.",
            7: "Gardening description with deliberately wrong Astronomy subject; unrelated to floods.",
            8: "Abstract missing: cannot establish relevance from available evidence.",
            9: "Flood is a metaphor for donations; explicitly no water disaster.",
            11: "Coastal location explicitly excludes Appalachia.",
            12: "Forecast grids explicitly exclude lived experience and response.",
            14: "Bibliography explicitly lacks relevant evidence in its description.",
        }
        labels.append({"id": f"R{i:03}", "relevant": bool(reason),
                       "assessment": "insufficient" if i == 8 else ("relevant" if reason else "not_relevant"),
                       "rationale": reason or negative.get(i, f"The complete description concerns {title.lower()}, with no Appalachian flood experience or response evidence."),
                       "evidence": [abstract] if reason else [], "reviewed_text": abstract})
    for number, original in [(59, 1), (60, 2)]:
        r = dict(records[original - 1])
        r.update(id=f"R{number:03}", source_locator=f"data/raw/catalog-v1.jsonl#L{number}", import_batch="teaching-export-02")
        records.append(r)
        label = dict(labels[original - 1])
        label.update(id=r["id"], rationale="Duplicate task content from a separate export row; same evidence, separate source mapping.")
        labels.append(label)
    raw = "".join(json.dumps(r, ensure_ascii=False, sort_keys=True) + "\n" for r in records)
    (ROOT / "data/raw/catalog-v1.jsonl").write_text(raw, encoding="utf-8")
    write_json(ROOT / "data/retrieval-gold.json", {
        "provenance": "Codex-assisted synthetic-fixture authoring and per-record inspection; not librarian annotation or an independent expert judgment.",
        "fixed_before_first_retrieval_run": True,
        "criterion": "Description supplies evidence of lived experience or community response to river flooding in Appalachia. The two export duplicates count as separate source records. Insufficient descriptions are not positives.",
        "records": labels,
    })
    write_json(ROOT / "data/subject-boundaries.json", {
        "mismatch_id": "R007", "missing_abstract_id": "R008",
        "separate_edition": ["R001", "R015"], "separate_copy": ["R001", "R016"],
        "restriction_ids": ["R005", "R016", "R020"],
        "exact_groups": [["R001", "R059"], ["R002", "R060"]],
    })
    second = [dict(r) for r in records if r["id"] != "R004"]
    for r in second:
        if r["id"] == "R005":
            r["status"] = "inactive"
        if r["id"] == "R007":
            r["subjects"] = ["Agriculture"]
        if r["id"] == "R020":
            r["restrictions"] = "Plate 4 is now included in the demonstration scan; check its caption before reuse."
    for number, title, abstract in [(61, "Community seed library inventory", "An inventory lists seed packets, storage dates and germination notes."), (62, "Appalachian flood volunteer kitchen", "A description records an Appalachian community running a shared kitchen after a river flood.")]:
        r = dict(records[0])
        r.update(id=f"R{number:03}", title=title, abstract=abstract,
                 subjects=["Agriculture"] if number == 61 else ["Floods", "Appalachia"],
                 material_type="report", date="2025-06-15", catalog_ui={"expanded": False, "sort_position": number, "thumbnail": "placeholder.svg"}, local_shelf=f"DEMO/report/{number}")
        second.append(r)
    for line, r in enumerate(second, 1):
        r["source_locator"] = f"data/raw/catalog-v2.jsonl#L{line}"
    (ROOT / "data/raw/catalog-v2.jsonl").write_text("".join(json.dumps(r, ensure_ascii=False, sort_keys=True) + "\n" for r in second), encoding="utf-8")
    paths = ["data/raw/catalog-v1.jsonl", "data/raw/catalog-v2.jsonl", "data/retrieval-gold.json", "data/subject-boundaries.json"]
    write_json(ROOT / "data/fixture-lock.json", {"stage": "Authored and fixed before implementing retrieval; hashes checked on each demo run.", "files": {p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest() for p in paths}})
    print("Fixed 60 first-export rows, 61 updated-export rows, and 60 relevance judgments.")


if __name__ == "__main__":
    main()
