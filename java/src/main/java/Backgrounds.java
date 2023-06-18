import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.stream.Collectors;

public class Backgrounds {
	public static void main(String[] args) {
		String line = "";
		String[] parts = new String[0];
		try (BufferedReader br = new BufferedReader(new InputStreamReader(Backgrounds.class.getClassLoader().getResourceAsStream("backgrounds.csv")))) {
			line = br.readLine();
			while ((line = br.readLine()) != null) {
				parts = line.split("\t");
				System.out.println("{\"background\":\"" + parts[0]//
						+ "\",\"aptitudes\":[" + Arrays.stream(parts[5].split(" or ")).map(x -> "\"" + x + "\"").collect(Collectors.joining(",")) //
						+ "]},");
			}
		} catch (Exception ex) {
			System.err.println(line);
			System.err.println(Arrays.stream(parts).collect(Collectors.joining(" --- ")));
			ex.printStackTrace();
		}
	}
}
