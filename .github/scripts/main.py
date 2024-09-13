#!/usr/bin/env python3

import git,os,argparse,yaml,json,shutil,hashlib,gzip,logging,time
from colorama import init, Fore, Style
from git.exc import GitError

# Initialize Colorama
init(autoreset=True)

# Colorama color definitions
class CustomFormatter(logging.Formatter):
    def format(self, record):
        color = {
            'DEBUG': Fore.CYAN,
            'INFO': Fore.GREEN,
            'WARNING': Fore.YELLOW,
            'ERROR': Fore.RED,
            'CRITICAL': Fore.RED + Style.BRIGHT
        }.get(record.levelname, Fore.WHITE)
        return color + super().format(record) + Style.RESET_ALL

# Ensure the log directory exists
log_dir = '.log'
os.makedirs(log_dir, exist_ok=True)

# Setup colorful logging configuration
log_format = "%(asctime)s - %(levelname)s - %(message)s"
formatter = CustomFormatter(log_format)

console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)

file_handler = logging.FileHandler(os.path.join(log_dir, "clone.log"))
file_handler.setFormatter(formatter)

logging.basicConfig(
    level=logging.INFO,
    handlers=[console_handler, file_handler]
)

# Function to read repos from a wordlist file (owner/repo_name format)
def load_repo_list(wordlist_file):
    try:
        logging.info(f"Loading repository list from {wordlist_file}...")
        with open(wordlist_file, 'r',encoding='utf-8') as f:
            repo_list = [line.strip() for line in f if line.strip()]
        logging.info(f"Loaded {len(repo_list)} repositories from {wordlist_file}.")
        return repo_list
    except FileNotFoundError:
        logging.error(f"Wordlist file {wordlist_file} not found.")
        return []

# Function to clone the repository
def clone_repo(repo_url, clone_dir):
    try:
        logging.info(f"Cloning repository {repo_url} into {clone_dir}...")
        git.Repo.clone_from(repo_url, clone_dir)
        logging.info(f"Successfully cloned {repo_url} into {clone_dir}.")
        return True
    except GitError as e:
        logging.error(f"Error cloning {repo_url}: {e}")
        return False
    except Exception as e:
        logging.error(f"An unexpected error occurred while cloning {repo_url}: {e}")
        return False

# Function to compute SHA-256 hash of a file for filtering duplicates
def compute_file_hash(file_path):
    hasher = hashlib.sha256()
    try:
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hasher.update(chunk)
        return hasher.hexdigest()
    except Exception as e:
        logging.error(f"Error computing hash for file {file_path}: {e}")
        return None

# Function to map original keys to their initials 
def map_keys_to_initials(data):
    key_mapping = {
        'name': 'n',
        'severity': 's',
        'tags': 't',
        'repo_name': 'r',
        'file_hash': 'h',
        'file_path': 'p'
    }
    return {key_mapping.get(k, k): v for k, v in data.items()}

# Function to convert severity to its initial
def severity_to_initial(severity):
    severity_mapping = {
        'critical': 'C',
        'high': 'H',
        'medium': 'M',
        'low': 'L',
        'info': 'I',
        'unknown': 'U'
    }
    return severity_mapping.get(severity.lower(), 'U')

# Function to find and parse all templates in a repo
def parse_yaml_files(repo_dir, repo_name):
    yaml_data = []
    logging.info(f"Scanning directory {repo_dir} for Templates files...")

    for root, dirs, files in os.walk(repo_dir):
        for file in files:
            if file.endswith(".yaml"):
                yaml_path = os.path.join(root, file)
                file_hash = compute_file_hash(yaml_path)
                if not file_hash:
                    continue  # Skip this file if hash computation failed
                try:
                    with open(yaml_path, 'r',encoding='utf-8') as f:
                        yaml_content = yaml.safe_load(f)
                        if 'info' in yaml_content:
                            data = {
                                'name': yaml_content['info'].get('name', ''),
                                'severity': severity_to_initial(yaml_content['info'].get('severity', '')),
                                'tags': yaml_content['info'].get('tags', ''),
                                'repo_name': repo_name,  
                                'file_hash': file_hash,  
                                'file_path': os.path.relpath(yaml_path, repo_dir)
                            }
                            yaml_data.append(map_keys_to_initials(data))
                except yaml.YAMLError as e:
                    logging.error(f"YAML parsing error in file {yaml_path}: {e}")
                except Exception as e:
                    # Log any other unexpected errors and skip the file
                    logging.error(f"Error processing YAML file {yaml_path}: {e}")

    return yaml_data

def write_unique_json(data, output_file):
    seen_hashes = set()
    seen_names = set()
    unique_data = []

    for item in data:
        if not isinstance(item, dict):
            continue  # Skip if item is not a dictionary

        file_hash = item.get('h')
        name = item.get('n', '').strip() if item.get('n') is not None else ''

        if name and name not in seen_names:
            if file_hash and file_hash not in seen_hashes:
                seen_hashes.add(file_hash)
                seen_names.add(name)
                unique_data.append(item)

    # Remove 'file_hash' field from final output
    final_data = [{k: v for k, v in item.items() if k != 'h'} for item in unique_data]

    # Remove items with the same name or empty name
    final_data = [item for item in final_data if item.get('n', '').strip()]

    logging.info(f"Writing unique data to {output_file}...")
    with open(output_file, 'w') as json_file:
        json.dump(final_data, json_file, indent=4)
    logging.info(f"Stored unique data in {output_file}.")

    # Print the absolute path of the output file
    abs_output_path = os.path.abspath(output_file)
    print(f"Output JSON file saved at: {abs_output_path}")


# Function to compress the JSON file, calculate its hash, and print the absolute paths
def compress_and_hash(json_file, compressed_file, hash_file):
    logging.info(f"Compressing {json_file} to {compressed_file}...")
    try:
        with open(json_file, 'rb') as f_in, gzip.open(compressed_file, 'wb') as f_out:
            shutil.copyfileobj(f_in, f_out)
        logging.info(f"Compressed {json_file} to {compressed_file}.")

        # Calculate hash of the compressed file
        file_hash = compute_file_hash(compressed_file)
        if file_hash:
            with open(hash_file, 'w') as hf:
                hf.write(file_hash)
            logging.info(f"Stored hash of compressed file in {hash_file}.")

        # Print the absolute paths of the compressed file and the hash file
        abs_compressed_path = os.path.abspath(compressed_file)
        abs_hash_path = os.path.abspath(hash_file)
        print(f"Compressed file saved at: {abs_compressed_path}")
        print(f"Hash file saved at: {abs_hash_path}")

        # Delete the JSON file
        os.remove(json_file)
        logging.info(f"Deleted the original JSON file {json_file}.")

    except Exception as e:
        logging.error(f"Error during compression or hash calculation: {e}")



# Function to delete the cloned repository directory
def delete_repo_dir(repo_dir):
    logging.info(f"Attempting to delete repository directory {repo_dir}...")
    try:
        shutil.rmtree(repo_dir)
        logging.info(f"Deleted repository directory {repo_dir}.")
    except Exception as e:
        logging.error(f"Error deleting repository directory {repo_dir}: {e}")

# Function to process each repository
def process_repo(repo, output_dir, all_yaml_data, remaining_repos):
    owner, repo_name = repo.split('/')
    repo_url = f"https://github.com/{owner}/{repo_name}.git"

    logging.info(f"Processing repository {repo}...")

    # Define the path to clone the repo
    clone_dir = os.path.join(output_dir, repo_name)

    # Clone the repo
    if clone_repo(repo_url, clone_dir):
        # Parse all templates and store the data as JSON
        yaml_data = parse_yaml_files(clone_dir, repo)
        all_yaml_data.extend(yaml_data)
        # Delete the cloned repository after parsing
        delete_repo_dir(clone_dir)

    # Update the remaining repos count
    remaining_repos[0] -= 1
    logging.info(f"Finished processing repository {repo}. {remaining_repos[0]} repositories left to process.")

# Main function to handle command-line arguments
def main():
    start_time = time.time()  # Record start time

    parser = argparse.ArgumentParser(description="Clone GitHub repositories and parse valid templates")
    # Positional argument: path to wordlist file
    parser.add_argument('wordlist', type=str, help="Repo wordlist (owner/repo_name format)")

    args = parser.parse_args()

    # Load the list of repositories from the wordlist file
    repo_list = load_repo_list(args.wordlist)
    if not repo_list:
        return

    # Create output directory if it does not exist
    output_dir = 'repositories'
    os.makedirs(output_dir, exist_ok=True)
    # Track all YAML data
    all_yaml_data = []
    # Initialize remaining repositories count
    remaining_repos = [len(repo_list)]
    # Process each repository
    for repo in repo_list:
        process_repo(repo, output_dir, all_yaml_data, remaining_repos)

    # Write unique data to JSON file
    output_file = 'data.json'
    write_unique_json(all_yaml_data, output_file)
    # Compress the JSON file and store its hash
    compressed_file = 'data.json.gz'
    hash_file = 'hash.txt'
    compress_and_hash(output_file, compressed_file, hash_file)

    end_time = time.time()  # Record end time
    elapsed_time = end_time - start_time
    logging.info(f"Script completed in {elapsed_time:.2f} seconds.")

if __name__ == "__main__":
    main()